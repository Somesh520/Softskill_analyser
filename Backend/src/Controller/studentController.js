import { getStudentDashboardSummaryService } from '../Services/studentService.js';

// @desc    Get dashboard summary and reports for student
// @route   GET /api/student/dashboard/summary
// @access  Private (Student)
export const getStudentDashboardSummary = async (req, res) => {
    try {
        const studentId = req.user.id;
        const result = await getStudentDashboardSummaryService(studentId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
