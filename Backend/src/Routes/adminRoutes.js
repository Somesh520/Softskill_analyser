import express from 'express';
import { addTeacher, getAllTeachers } from '../Controller/adminController.js';
import { verifyToken, requireRole } from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Protect ALL routes in this file to require a valid token AND the 'admin' role
router.use(verifyToken);
router.use(requireRole('admin'));

// Route:  POST /api/admin/add-teacher
router.post('/add-teacher', addTeacher);

// Route:  GET /api/admin/teachers
router.get('/teachers', getAllTeachers);

export default router;