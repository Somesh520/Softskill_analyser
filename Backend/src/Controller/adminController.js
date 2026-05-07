import { addTeacherService, getAllTeachersService, removeTeacherService, getAllStudentsService, getCollegeAnalyticsService, getClassPerformanceService, getDepartmentAnalyticsService, getStudentPerformanceDistributionService, getActivityAnalyticsService } from '../Services/adminService.js';

// @desc    Add a single Teacher
// @route   POST /api/admin/add-teacher
// @access  Private (Admin Only)
export const addTeacher = async (req, res) => {
    try {
        const { name, email, password, deptName } = req.body;
        const adminId = req.user.id;

        const newTeacher = await addTeacherService(adminId, name, email, password, deptName);
        
        res.status(201).json({
            message: 'Teacher successfully assigned',
            teacher: newTeacher
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
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
        const analytics = await getCollegeAnalyticsService();
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
        const performance = await getClassPerformanceService();
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
        const analytics = await getDepartmentAnalyticsService();
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
        const distribution = await getStudentPerformanceDistributionService();
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
        const analytics = await getActivityAnalyticsService();
        res.status(200).json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};