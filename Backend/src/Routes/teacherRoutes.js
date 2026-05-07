import express from 'express';
import multer from 'multer';
import { 
  createClass, 
  getClasses, 
  getClassDetails, 
  assignTeacher, 
  uploadStudentCsv, 
  deleteClass, 
  deleteStudentFromClass, 
  createActivity, 
  getActivities,
  deleteActivity,
  downloadActivityTemplate,
  uploadActivityMarks,
  getActivitySubmissions,
  getActivityAnalytics,
  editActivityMarks 
} from '../Controller/teacherController.js';
import { verifyToken, requireRole } from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Multer setup for memory storage (max 2MB file size)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// All routes here are protected and require the 'teacher' role
router.use(verifyToken);
router.use(requireRole('teacher'));

router.get('/activities/:id/template', downloadActivityTemplate);
router.get('/activities/:id/submissions', getActivitySubmissions);
router.get('/activities/:id/analytics', getActivityAnalytics);
router.post('/activities/:id/upload-marks', upload.single('file'), uploadActivityMarks);
router.patch('/activities/:activityId/submissions/:submissionId', editActivityMarks);
router.post('/assign-student', assignTeacher);
// Class Management
router.post('/create-class', createClass);
router.get('/classes', getClasses);
router.get('/classes/:id', getClassDetails);
router.delete('/classes/:id', deleteClass);
router.delete('/classes/:classId/students/:studentId', deleteStudentFromClass);
router.post('/classes/:id/upload-students', upload.single('file'), uploadStudentCsv);

// Activity Management
router.post('/activities', createActivity);
router.get('/activities', getActivities);
router.delete('/activities/:id', deleteActivity);

export default router;