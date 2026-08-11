import express from 'express';
import { getStudentDashboardSummary, getStudentDriftInsights } from '../Controller/studentController.js';
import { verifyToken, requireRole } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('student'));

router.get('/dashboard/summary', getStudentDashboardSummary);
router.get('/drift-insights', getStudentDriftInsights);

export default router;
