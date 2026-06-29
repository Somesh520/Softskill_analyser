import { 
    createClassService, 
    getClassesService, 
    getClassDetailsService, 
    assignTeacherService, 
    uploadStudentCsvService, 
    deleteClassService, 
    deleteStudentFromClassService,
    createActivityService,
    getActivitiesService,
    deleteActivityService,
    downloadActivityTemplateService,
    uploadActivityMarksService,
    getActivitySubmissionsService,
    getActivityAnalyticsService,
    editActivityMarksService,
    getTeacherReportsSummaryService,
    addStudentManuallyService,
    getTeachersService,
    updateStudentPlacementService,
    getStudentReportByTeacherService
} from '../Services/teacherService.js';
import { createClassSchema, assignTeacherSchema, createActivitySchema, addStudentManuallySchema, updatePlacementSchema } from '../Schemas_zod/teacherSchema_zod.js';

// ... existing code ...

// @desc    Download CSV template for activity marks
// @route   GET /api/teacher/activities/:id/template
// @access  Private (Teacher)
export const downloadActivityTemplate = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const activityId = req.params.id;
        const { filename, content } = await downloadActivityTemplateService(teacherId, activityId);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.status(200).send(content);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Upload filled CSV with marks
// @route   POST /api/teacher/activities/:id/upload-marks
// @access  Private (Teacher)
export const uploadActivityMarks = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No CSV file uploaded' });
        
        const teacherId = req.user.id;
        const activityId = req.params.id;
        const result = await uploadActivityMarksService(teacherId, activityId, req.file.buffer);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get uploaded marks for an activity
// @route   GET /api/teacher/activities/:id/submissions
// @access  Private (Teacher)
export const getActivitySubmissions = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const activityId = req.params.id;
        const result = await getActivitySubmissionsService(teacherId, activityId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Edit marks for a submission
// @route   PATCH /api/teacher/activities/:activityId/submissions/:submissionId
// @access  Private (Teacher)
export const editActivityMarks = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const teacherName = req.user.name;
        const { activityId, submissionId } = req.params;
        const { criteriaMarks, feedback } = req.body;

        const result = await editActivityMarksService(teacherId, activityId, submissionId, { criteriaMarks, feedback }, teacherName);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get analytics for an activity
// @route   GET /api/teacher/activities/:id/analytics
// @access  Private (Teacher)
export const getActivityAnalytics = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const activityId = req.params.id;
        const result = await getActivityAnalyticsService(teacherId, activityId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create a new activity for a class
// @route   POST /api/teacher/activities
// @access  Private (Teacher)
export const createActivity = async (req, res) => {
    try {
        const parsedBody = createActivitySchema.parse(req.body);
        const teacherId = req.user.id;
        const activity = await createActivityService(teacherId, parsedBody);
        res.status(201).json(activity);
    } catch (error) {
        if (error.name === 'ZodError') {
            const errList = error.errors || error.issues;
            return res.status(400).json({ message: errList ? errList.map(e => e.message).join(', ') : error.message });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all activities (optionally filtered by class)
// @route   GET /api/teacher/activities
// @access  Private (Teacher)
export const getActivities = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { classId } = req.query;
        const activities = await getActivitiesService(teacherId, classId);
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an activity
// @route   DELETE /api/teacher/activities/:id
// @access  Private (Teacher)
export const deleteActivity = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const activityId = req.params.id;
        const result = await deleteActivityService(teacherId, activityId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create a new class
// @route   POST /api/teacher/create-class
// @access  Private (Teacher)
export const createClass = async (req, res) => {
    try {
        const classData = createClassSchema.parse(req.body);
        const teacherId = req.user.id;

        const newClass = await createClassService(teacherId, classData);

        res.status(201).json({
            message: 'Class created successfully',
            class: newClass
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
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
        const { studentId, classId } = assignTeacherSchema.parse(req.body);

        // Call the service to assign the student to the class
        const result = await assignTeacherService(teacherId, studentId, classId);

        res.status(200).json({
            message: 'Student assigned to class successfully',
            assignment: result
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
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

// @desc    Get reports summary for teacher dashboard
// @route   GET /api/teacher/reports/summary
// @access  Private (Teacher)
export const getTeacherReportsSummary = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { classId } = req.query;
        const result = await getTeacherReportsSummaryService(teacherId, classId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add a student manually to a class
// @route   POST /api/teacher/classes/:classId/students
// @access  Private (Teacher)
export const addStudentManually = async (req, res) => {
    try {
        const parsedBody = addStudentManuallySchema.parse(req.body);
        const teacherId = req.user.id;
        const { classId } = req.params;
        const result = await addStudentManuallyService(teacherId, classId, parsedBody);
        res.status(201).json(result);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all teachers
// @route   GET /api/teacher/teachers
// @access  Private (Teacher)
export const getTeachersList = async (req, res) => {
    try {
        const teachers = await getTeachersService();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student placement details
// @route   PUT /api/teacher/classes/:classId/students/:studentId/placement
// @access  Private (Teacher)
export const updateStudentPlacement = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { classId, studentId } = req.params;
        const placementData = updatePlacementSchema.parse(req.body);

        const result = await updateStudentPlacementService(teacherId, classId, studentId, placementData);

        res.status(200).json(result);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get complete student report by teacher
// @route   GET /api/teacher/classes/:classId/students/:studentId/report
// @access  Private (Teacher)
export const getStudentReportByTeacher = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { classId, studentId } = req.params;
        
        const report = await getStudentReportByTeacherService(teacherId, classId, studentId);
        res.status(200).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

