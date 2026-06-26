import express from 'express';
import { 
    createSurvey, 
    getTeacherSurveys, 
    toggleSurveyStatus, 
    getStudentSurveys,
    submitSurvey,
    generateSurveyQuestions,
    getAllSurveys,
    getSurveyResponses,
    deleteSurvey
} from '../Controller/surveyController.js';
import { verifyToken, requireRole } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// Admin Routes (Admins can do everything a teacher can + view all)
router.post('/admin', requireRole('admin'), createSurvey);
router.post('/admin/generate', requireRole('admin'), generateSurveyQuestions);
router.get('/admin', requireRole('admin'), getAllSurveys);
router.put('/admin/:id/toggle', requireRole('admin'), toggleSurveyStatus);
router.get('/admin/:id/responses', requireRole('admin'), getSurveyResponses);
router.delete('/admin/:id', requireRole('admin'), deleteSurvey);

// Teacher Routes
router.post('/teacher', requireRole('teacher'), createSurvey);
router.post('/teacher/generate', requireRole('teacher'), generateSurveyQuestions);
router.get('/teacher', requireRole('teacher'), getTeacherSurveys);
router.put('/teacher/:id/toggle', requireRole('teacher'), toggleSurveyStatus);
router.get('/teacher/:id/responses', requireRole('teacher'), getSurveyResponses);
router.delete('/teacher/:id', requireRole('teacher'), deleteSurvey);

// Student Routes
router.get('/student', requireRole('student'), getStudentSurveys);
router.post('/student/:id', requireRole('student'), submitSurvey);

export default router;
