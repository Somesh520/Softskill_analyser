import { addTeacherService, getAllTeachersService, removeTeacherService, getAllStudentsService, getCollegeAnalyticsService, getClassPerformanceService, getDepartmentAnalyticsService, getStudentPerformanceDistributionService, getActivityAnalyticsService, getLogsService } from '../Services/adminService.js';
import { addTeacherSchema } from '../Schemas_zod/adminSchema_zod.js';

// @desc    Add a single Teacher
// @route   POST /api/admin/add-teacher
// @access  Private (Admin Only)
export const addTeacher = async (req, res) => {
    try {
        const { name, email, password, deptName } = addTeacherSchema.parse(req.body);
        const adminId = req.user.id;

        const newTeacher = await addTeacherService(adminId, name, email, password, deptName);
        
        res.status(201).json({
            message: 'Teacher successfully assigned',
            teacher: newTeacher
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            const issues = error.errors || error.issues || [];
            return res.status(400).json({ message: issues.map(e => e.message).join(', ') });
        }
        res.status(400).json({ message: error.message || 'An unknown error occurred' });
    }
};

// @desc    Get all Teachers
// @route   GET /api/admin/teachers
// @access  Private (Admin Only)
export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await getAllTeachersService();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove a Teacher
// @route   DELETE /api/admin/teachers/:id
// @access  Private (Admin Only)
export const removeTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await removeTeacherService(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Get all Students
// @route   GET /api/admin/students
// @access  Private (Admin Only)
export const getAllStudents = async (req, res) => {
    try {
        const students = await getAllStudentsService();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get College Wide Analytics
// @route   GET /api/admin/analytics/college
// @access  Private (Admin Only)
export const getCollegeAnalytics = async (req, res) => {
    try {
        const analytics = await getCollegeAnalyticsService(req.query);
        res.status(200).json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Class Performance Analytics
// @route   GET /api/admin/analytics/class-performance
// @access  Private (Admin Only)
export const getClassPerformance = async (req, res) => {
    try {
        const performance = await getClassPerformanceService(req.query);
        res.status(200).json(performance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Department Analytics
// @route   GET /api/admin/analytics/departments
// @access  Private (Admin Only)
export const getDepartmentAnalytics = async (req, res) => {
    try {
        const analytics = await getDepartmentAnalyticsService(req.query);
        res.status(200).json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Student Performance Distribution
// @route   GET /api/admin/analytics/performance-distribution
// @access  Private (Admin Only)
export const getPerformanceDistribution = async (req, res) => {
    try {
        const distribution = await getStudentPerformanceDistributionService(req.query);
        res.status(200).json(distribution);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Activity Analytics
// @route   GET /api/admin/analytics/activities
// @access  Private (Admin Only)
export const getActivityAnalytics = async (req, res) => {
    try {
        const analytics = await getActivityAnalyticsService(req.query);
        res.status(200).json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Admin Logs
// @route   GET /api/admin/logs
// @access  Private (Admin Only)
export const getLogs = async (req, res) => {
    try {
        const logs = await getLogsService();
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Available Filters for Analytics
// @route   GET /api/admin/analytics/filters
// @access  Private (Admin Only)
export const getAnalyticsFilters = async (req, res) => {
    try {
        // Dynamic import to avoid circular dependency if not imported at top
        const Class = (await import('../Models/Classmodel.js')).default;
        
        const branches = await Class.distinct('branch');
        const semesters = await Class.distinct('semester');
        const sections = await Class.distinct('section');

        res.status(200).json({ branches, semesters, sections });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllClasses = async (req, res) => { try { const Class = (await import('../Models/Classmodel.js')).default; const classes = await Class.find().sort({ semester: 1, branch: 1, section: 1 }); res.status(200).json(classes); } catch (error) { res.status(500).json({ success: false, message: error.message }); } };
