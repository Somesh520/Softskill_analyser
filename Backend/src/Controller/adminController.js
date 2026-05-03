import { addTeacherService, getAllTeachersService, getAllStudentsService } from '../Services/adminService.js';

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