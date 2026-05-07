import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import DashboardLayout from '../components/layout/DashboardLayout';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AssignTeacher from '../pages/admin/AssignTeacher';
import ManageTeachers from '../pages/admin/ManageTeachers';
import ManageStudents from '../pages/admin/ManageStudents';
import CollegeReport from '../pages/admin/CollegeReport';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/Dashboard';
import MyClasses from '../pages/teacher/MyClasses';
import ClassDetails from '../pages/teacher/ClassDetails';
import AssignedStudents from '../pages/teacher/AssignedStudents';
import CreateActivity from '../pages/teacher/CreateActivity';
import UploadMarks from '../pages/teacher/UploadMarks';
import TeacherReports from '../pages/teacher/Reports';

// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import MyReports from '../pages/student/MyReports';
import SemesterReport from '../pages/student/SemesterReport';

// Common Pages
import SettingsPage from '../pages/common/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Admin Routes */}
      <Route element={<DashboardLayout role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/college-report" element={<CollegeReport />} />
        <Route path="/admin/assign-teacher" element={<AssignTeacher />} />
        <Route path="/admin/teachers" element={<ManageTeachers />} />
        <Route path="/admin/students" element={<ManageStudents />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>

      {/* Teacher Routes */}
      <Route element={<DashboardLayout role="teacher" />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/classes" element={<MyClasses />} />
        <Route path="/teacher/classes/:id" element={<ClassDetails />} />
        <Route path="/teacher/assigned-students" element={<AssignedStudents />} />
        <Route path="/teacher/create-activity" element={<CreateActivity />} />
        <Route path="/teacher/upload-marks" element={<UploadMarks />} />
        <Route path="/teacher/reports" element={<TeacherReports />} />
        <Route path="/teacher/settings" element={<SettingsPage />} />
      </Route>

      {/* Student Routes */}
      <Route element={<DashboardLayout role="student" />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/my-reports" element={<MyReports />} />
        <Route path="/student/semester-report" element={<SemesterReport />} />
        <Route path="/student/settings" element={<SettingsPage />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;
