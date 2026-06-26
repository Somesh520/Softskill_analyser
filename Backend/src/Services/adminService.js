import bcrypt from 'bcryptjs';
import User from '../Models/Usermodel.js';
import Class from '../Models/Classmodel.js';
import Activity from '../Models/Activitymodel.js';
import ActivitySubmission from '../Models/ActivitySubmissionmodel.js';
import Log from '../Models/Logmodel.js';
import Survey from '../Models/SurveyModel.js';
import SurveyResponse from '../Models/SurveyResponseModel.js';
import { sendEmail } from '../utils/emailService.js';
import { teacherWelcomeTemplate } from '../utils/emailTemplates.js';

export const addTeacherService = async (adminId, name, email, password, deptName) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
        throw new Error('A user with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTeacher = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'teacher',
        assignedByAdmin: adminId,
        deptName
    });

    const emailHtml = teacherWelcomeTemplate(name, normalizedEmail, password);
    sendEmail({
        to: normalizedEmail,
        subject: 'Welcome to Soft Skill Analyser - Your Teacher Account',
        html: emailHtml
    }).catch(err => {
        console.error('Failed to send welcome email to teacher in background:', err);
    });

    return {
        _id: newTeacher._id,
        name: newTeacher.name,
        email: newTeacher.email,
        role: newTeacher.role,
        deptName: newTeacher.deptName
    };
};

export const getAllTeachersService = async () => {
    return await User.find({ role: 'teacher' }).select('-password').sort({ createdAt: -1 });
};

export const removeTeacherService = async (teacherId) => {
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
        throw new Error('Teacher not found');
    }
    
    // 1. Delete all surveys created by the teacher
    const surveys = await Survey.find({ teacherId });
    const surveyIds = surveys.map(s => s._id);
    await SurveyResponse.deleteMany({ surveyId: { $in: surveyIds } });
    await Survey.deleteMany({ teacherId });

    // 2. Delete all activities created by the teacher
    const activities = await Activity.find({ teacherId });
    const activityIds = activities.map(a => a._id);
    await ActivitySubmission.deleteMany({ activityId: { $in: activityIds } });
    await Activity.deleteMany({ teacherId });

    // 3. Delete all classes created by the teacher
    await Class.deleteMany({ teacherId });

    // 4. Delete all students assigned by this teacher
    await User.deleteMany({ role: 'student', assignedByTeacher: teacherId });

    // 5. Finally, delete the teacher
    await User.findByIdAndDelete(teacherId);

    // Note: We are keeping the Logs intentionally for audit history, 
    // but the teacher and all their functional data are permanently wiped.

    return { message: 'Teacher and all related data removed successfully' };
};

export const getAllStudentsService = async () => {
    return await User.find({ role: 'student' })
        .select('-password')
        .populate('assignedByTeacher', 'name email deptName')
        .populate('classId', 'name semester')
        .sort({ createdAt: -1 });
};

// Analytics Services for College Reports
export const getCollegeAnalyticsService = async (filters = {}) => {
    try {
        const classMatch = {};
        if (filters.branch) classMatch.branch = filters.branch;
        if (filters.semester) classMatch.semester = Number(filters.semester);
        if (filters.section) classMatch.section = filters.section;

        let totalClasses = await Class.countDocuments(classMatch);
        let targetClassIds = [];
        
        if (Object.keys(classMatch).length > 0) {
            const classes = await Class.find(classMatch).select('_id');
            targetClassIds = classes.map(c => c._id);
        }

        const userMatch = { role: 'student' };
        if (targetClassIds.length > 0) {
            userMatch.classId = { $in: targetClassIds };
        } else if (Object.keys(classMatch).length > 0) {
            // If filters were applied but no classes found, return 0 for everything
            return { totalStudents: 0, totalActivities: 0, totalSubmissions: 0, totalClasses: 0, avgPerformance: 0, submissionRate: 0 };
        }

        const targetStudents = await User.find(userMatch).select('_id');
        const studentIds = targetStudents.map(s => s._id);

        const totalStudents = studentIds.length;
        const totalActivities = await Activity.countDocuments();
        
        const submissionMatch = {};
        if (studentIds.length > 0) {
            submissionMatch.studentId = { $in: studentIds };
        } else if (Object.keys(classMatch).length > 0) {
            submissionMatch.studentId = { $in: [] }; // No students, no submissions
        }

        const totalSubmissions = await ActivitySubmission.countDocuments(submissionMatch);

        const pipeline = [];
        if (Object.keys(submissionMatch).length > 0) {
            pipeline.push({ $match: submissionMatch });
        }
        
        pipeline.push({
            $group: {
                _id: null,
                avgPerformance: { $avg: '$totalMarks' },
                maxMarks: { $max: '$totalMarks' },
                minMarks: { $min: '$totalMarks' }
            }
        });

        // Get average performance
        const performanceData = await ActivitySubmission.aggregate(pipeline);

        const avgPerformance = performanceData[0]?.avgPerformance || 0;

        return {
            totalStudents,
            totalActivities,
            totalSubmissions,
            totalClasses,
            avgPerformance: Math.round(avgPerformance * 100) / 100,
            submissionRate: totalActivities > 0 ? Math.round((totalSubmissions / (totalStudents * totalActivities)) * 100) : 0
        };
    } catch (error) {
        throw new Error('Failed to fetch college analytics: ' + error.message);
    }
};

export const getClassPerformanceService = async (filters = {}) => {
    try {
        const matchStage = {};
        if (filters.branch) matchStage.branch = filters.branch;
        if (filters.semester) matchStage.semester = Number(filters.semester);
        if (filters.section) matchStage.section = filters.section;

        const classPerformance = await Class.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    let: { classId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$role', 'student'] },
                                        { $eq: ['$classId', '$$classId'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'students'
                }
            },
            {
                $lookup: {
                    from: 'activitysubmissions',
                    let: { studentIds: '$students._id' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$studentId', '$$studentIds'] } } }
                    ],
                    as: 'submissions'
                }
            },
            {
                $project: {
                    name: 1,
                    program: 1,
                    branch: 1,
                    semester: 1,
                    section: 1,
                    totalStudents: { $size: '$students' },
                    totalSubmissions: { $size: '$submissions' },
                    avgPercentage: {
                        $cond: [
                            { $gt: [{ $size: '$submissions' }, 0] },
                            {
                                $round: [
                                    { $avg: '$submissions.totalMarks' },
                                    2
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            { $sort: { avgPercentage: -1 } },
            { $limit: 20 }
        ]);

        return classPerformance;
    } catch (error) {
        throw new Error('Failed to fetch class performance: ' + error.message);
    }
};

export const getDepartmentAnalyticsService = async () => {
    try {
        const departmentAnalytics = await User.aggregate([
            { $match: { role: 'teacher' } },
            { $unwind: { path: '$deptName', preserveNullAndEmptyArrays: true } },
            { $group: { _id: '$deptName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Map to department names for better readability
        const deptMap = {
            'cse': 'Computer Science',
            'ece': 'Electronics',
            'mech': 'Mechanical',
            'civil': 'Civil',
            'ee': 'Electrical'
        };

        return departmentAnalytics.map(dept => ({
            name: deptMap[dept._id?.toLowerCase()] || dept._id || 'Others',
            value: dept.count,
            percentage: Math.round((dept.count / departmentAnalytics.reduce((sum, d) => sum + d.count, 0)) * 100)
        }));
    } catch (error) {
        throw new Error('Failed to fetch department analytics: ' + error.message);
    }
};

export const getStudentPerformanceDistributionService = async (filters = {}) => {
    try {
        let submissionMatch = {};
        if (filters.branch || filters.semester || filters.section) {
            const classMatch = {};
            if (filters.branch) classMatch.branch = filters.branch;
            if (filters.semester) classMatch.semester = Number(filters.semester);
            if (filters.section) classMatch.section = filters.section;
            
            const classes = await Class.find(classMatch).select('_id');
            const targetClassIds = classes.map(c => c._id);
            
            const targetStudents = await User.find({ role: 'student', classId: { $in: targetClassIds } }).select('_id');
            submissionMatch.studentId = { $in: targetStudents.map(s => s._id) };
        }

        const pipeline = [];
        if (Object.keys(submissionMatch).length > 0) {
            pipeline.push({ $match: submissionMatch });
        }

        pipeline.push({
            $bucket: {
                groupBy: '$totalMarks',
                boundaries: [0, 20, 40, 60, 80, 100],
                default: 'Other',
                output: { count: { $sum: 1 } }
            }
        });

        const distribution = await ActivitySubmission.aggregate(pipeline);

        const labels = ['0-20', '20-40', '40-60', '60-80', '80-100'];
        const formattedData = labels.map((label, idx) => ({
            range: label,
            count: distribution[idx]?.count || 0
        }));

        return formattedData;
    } catch (error) {
        throw new Error('Failed to fetch performance distribution: ' + error.message);
    }
};

export const getActivityAnalyticsService = async (filters = {}) => {
    try {
        let submissionMatchExpr = { $expr: { $eq: ['$activityId', '$$activityId'] } };
        
        if (filters.branch || filters.semester || filters.section) {
            const classMatch = {};
            if (filters.branch) classMatch.branch = filters.branch;
            if (filters.semester) classMatch.semester = Number(filters.semester);
            if (filters.section) classMatch.section = filters.section;
            
            const classes = await Class.find(classMatch).select('_id');
            const targetStudents = await User.find({ role: 'student', classId: { $in: classes.map(c => c._id) } }).select('_id');
            
            submissionMatchExpr = {
                $expr: {
                    $and: [
                        { $eq: ['$activityId', '$$activityId'] },
                        { $in: ['$studentId', targetStudents.map(s => s._id)] }
                    ]
                }
            };
        }

        const activityAnalytics = await Activity.aggregate([
            {
                $lookup: {
                    from: 'activitysubmissions',
                    let: { activityId: '$_id' },
                    pipeline: [
                        { $match: submissionMatchExpr }
                    ],
                    as: 'submissions'
                }
            },
            {
                $project: {
                    name: '$title',
                    createdAt: 1,
                    totalSubmissions: { $size: '$submissions' },
                    avgMarks: {
                        $cond: [
                            { $gt: [{ $size: '$submissions' }, 0] },
                            { $round: [{ $avg: '$submissions.totalMarks' }, 2] },
                            0
                        ]
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 10 }
        ]);

        return activityAnalytics;
    } catch (error) {
        throw new Error('Failed to fetch activity analytics: ' + error.message);
    }
};

export const getLogsService = async () => {
    return await Log.find({})
        .populate('teacherId', 'name email deptName')
        .sort({ createdAt: -1 })
        .lean();
};