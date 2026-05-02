import { addTeacherService } from '../Services/adminService.js';

// @desc    Add a single Teacher
// @route   POST /api/admin/add-teacher
// @access  Private (Admin Only)
export const addTeacher = async (req, res) => {
    try {
        const { name, email, password, deptName } = req.body;
        const adminId = req.user.id; // Comes from our JWT verifyToken middleware

        const newTeacher = await addTeacherService(adminId, name, email, password, deptName);
        
        res.status(201).json({
            message: 'Teacher successfully assigned',
            teacher: newTeacher
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};