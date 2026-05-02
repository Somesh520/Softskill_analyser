import { createClassService, getClassesService, getClassDetailsService, assignTeacherService, uploadStudentCsvService, deleteClassService, deleteStudentFromClassService } from '../Services/teacherService.js';

// @desc    Create a new class
// @route   POST /api/teacher/create-class
// @access  Private (Teacher)
export const createClass = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const classData = req.body;

        const newClass = await createClassService(teacherId, classData);

        res.status(201).json({
            message: 'Class created successfully',
            class: newClass
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all classes for logged in teacher
// @route   GET /api/teacher/classes
// @access  Private (Teacher)
export const getClasses = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const classes = await getClassesService(teacherId);

        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get class details and its assigned students
// @route   GET /api/teacher/classes/:id
// @access  Private (Teacher)
export const getClassDetails = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const classId = req.params.id;
        const details = await getClassDetailsService(teacherId, classId);

        res.status(200).json(details);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Upload CSV to assign/create students
// @route   POST /api/teacher/classes/:id/upload-students
// @access  Private (Teacher)
export const uploadStudentCsv = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No CSV file uploaded' });
        }

        const teacherId = req.user.id;
        const classId = req.params.id;

        const result = await uploadStudentCsvService(teacherId, classId, req.file.buffer);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error processing CSV file' });
    }
};

export const assignTeacher = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { studentId, classId } = req.body;

        // Call the service to assign the student to the class
        const result = await assignTeacherService(teacherId, studentId, classId);

        res.status(200).json({
            message: 'Student assigned to class successfully',
            assignment: result
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a class
// @route   DELETE /api/teacher/classes/:id
// @access  Private (Teacher)
export const deleteClass = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const classId = req.params.id;
        await deleteClassService(teacherId, classId);
        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// @desc    Delete a student from a class
// @route   DELETE /api/teacher/classes/:classId/students/:studentId
// @access  Private (Teacher)
export const deleteStudentFromClass = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { classId, studentId } = req.params;
        await deleteStudentFromClassService(teacherId, classId, studentId);
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
