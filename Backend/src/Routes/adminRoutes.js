import express from 'express';
import { addTeacher, getAllTeachers, removeTeacher, getAllStudents, getCollegeAnalytics, getClassPerformance, getDepartmentAnalytics, getPerformanceDistribution, getActivityAnalytics } from '../Controller/adminController.js';
import { verifyToken, requireRole } from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Protect ALL routes in this file to require a valid token AND the 'admin' role
router.use(verifyToken);
router.use(requireRole('admin'));

// Route:  POST /api/admin/add-teacher
router.post('/add-teacher', addTeacher);

// Route:  GET /api/admin/teachers
router.get('/teachers', getAllTeachers);

// Route:  DELETE /api/admin/teachers/:id
router.delete('/teachers/:id', removeTeacher);

// Route:  GET /api/admin/students
router.get('/students', getAllStudents);

// Analytics Routes
router.get('/analytics/college', getCollegeAnalytics);
router.get('/analytics/class-performance', getClassPerformance);
router.get('/analytics/departments', getDepartmentAnalytics);
router.get('/analytics/performance-distribution', getPerformanceDistribution);
router.get('/analytics/activities', getActivityAnalytics);

export default router;