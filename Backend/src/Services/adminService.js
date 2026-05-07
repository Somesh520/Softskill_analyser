import bcrypt from 'bcryptjs';
import User from '../Models/Usermodel.js';
import Class from '../Models/Classmodel.js';
import Activity from '../Models/Activitymodel.js';
import ActivitySubmission from '../Models/ActivitySubmissionmodel.js';
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
    await User.findByIdAndDelete(teacherId);
    return { message: 'Teacher removed successfully' };
};

export const getAllStudentsService = async () => {
    return await User.find({ role: 'student' })
        .select('-password')
        .populate('assignedByTeacher', 'name email')
        .populate('classId', 'name semester')
        .sort({ createdAt: -1 });
};

// Analytics Services for College Reports
export const getCollegeAnalyticsService = async () => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalActivities = await Activity.countDocuments();
        const totalSubmissions = await ActivitySubmission.countDocuments();
        const totalClasses = await Class.countDocuments();

        // Get average performance
        const performanceData = await ActivitySubmission.aggregate([
            {
                $group: {
                    _id: null,
                    avgPerformance: { $avg: '$totalMarks' },
                    maxMarks: { $max: '$totalMarks' },
                    minMarks: { $min: '$totalMarks' }
                }
            }
        ]);

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

export const getClassPerformanceService = async () => {
    try {
        const classPerformance = await Class.aggregate([
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

export const getStudentPerformanceDistributionService = async () => {
    try {
        const distribution = await ActivitySubmission.aggregate([
            {
                $bucket: {
                    groupBy: '$totalMarks',
                    boundaries: [0, 20, 40, 60, 80, 100],
                    default: 'Other',
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

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

export const getActivityAnalyticsService = async () => {
    try {
        const activityAnalytics = await Activity.aggregate([
            {
                $lookup: {
                    from: 'activitysubmissions',
                    localField: '_id',
                    foreignField: 'activityId',
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