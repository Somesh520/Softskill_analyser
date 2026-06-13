import User from '../Models/Usermodel.js';
import Class from '../Models/Classmodel.js';
import Activity from '../Models/Activitymodel.js';
import ActivitySubmission from '../Models/ActivitySubmissionmodel.js';

export const getStudentDashboardSummaryService = async (studentId) => {
    // 1. Fetch student
    const student = await User.findOne({ _id: studentId, role: 'student' }).lean();
    if (!student) {
        throw new Error('Student profile not found.');
    }

    // 2. Fetch class
    let classObj = null;
    let teacher = null;
    let activities = [];
    
    if (student.classId) {
        classObj = await Class.findById(student.classId).lean();
    }

    // 3. Fetch teacher & activities
    if (classObj) {
        teacher = await User.findOne({ _id: classObj.teacherId, role: 'teacher' })
            .select('name email deptName')
            .lean();
            
        activities = await Activity.find({ classIds: classObj._id })
            .sort({ createdAt: -1 })
            .lean();
    }

    // 4. Fetch student submissions
    const submissions = await ActivitySubmission.find({ studentId }).lean();

    // 5. Compile activity details with grading status
    const activitiesList = activities.map(act => {
        const submission = submissions.find(sub => String(sub.activityId) === String(act._id));
        const criteriaMarks = submission 
            ? (submission.criteriaMarks instanceof Map ? Object.fromEntries(submission.criteriaMarks) : submission.criteriaMarks) 
            : {};

        return {
            _id: act._id,
            title: act.title,
            description: act.description,
            type: act.type,
            dueDate: act.dueDate,
            maxPoints: act.maxPoints,
            status: submission ? 'Graded' : 'Pending',
            score: submission ? submission.totalMarks : null,
            feedback: submission ? submission.feedback : '',
            criteriaMarks
        };
    });

    // 6. Calculate statistics
    const totalActivities = activities.length;
    const submittedActivities = submissions.length;
    const pendingActivities = totalActivities - submittedActivities;

    let totalMarksSum = 0;
    submissions.forEach(sub => {
        totalMarksSum += (sub.totalMarks || 0);
    });
    const avgScore = submittedActivities > 0 ? Math.round((totalMarksSum / submittedActivities) * 10) / 10 : 0;

    // 7. Calculate criteria performance breakdown (radar chart dataset)
    const criteriaSums = {};
    const criteriaCounts = {};

    submissions.forEach(sub => {
        if (sub.criteriaMarks) {
            const marksObj = sub.criteriaMarks instanceof Map ? Object.fromEntries(sub.criteriaMarks) : sub.criteriaMarks;
            for (const [criterion, score] of Object.entries(marksObj)) {
                if (score !== undefined && score !== null) {
                    criteriaSums[criterion] = (criteriaSums[criterion] || 0) + Number(score);
                    criteriaCounts[criterion] = (criteriaCounts[criterion] || 0) + 1;
                }
            }
        }
    });

    const criteriaPerformance = Object.keys(criteriaSums).map(criterion => {
        const sum = criteriaSums[criterion];
        const count = criteriaCounts[criterion];
        const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
        return {
            subject: criterion.charAt(0).toUpperCase() + criterion.slice(1),
            A: avg, // A represents the student's score
            fullMark: 100
        };
    });

    return {
        student: {
            _id: student._id,
            name: student.name,
            email: student.email,
            rollNo: student.rollNo,
            semester: student.semester,
            className: classObj ? `${classObj.name} (${classObj.section || 'A'})` : 'Not Assigned'
        },
        teacher: teacher ? {
            name: teacher.name,
            email: teacher.email,
            deptName: teacher.deptName || 'General'
        } : null,
        stats: {
            totalActivities,
            submittedActivities,
            pendingActivities,
            avgScore
        },
        activities: activitiesList,
        performance: criteriaPerformance
    };
};
