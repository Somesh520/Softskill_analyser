import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import AdminDashboard from '../pages/admin/Dashboard';
import AssignTeacher from '../pages/admin/AssignTeacher';
import TeacherDashboard from '../pages/teacher/Dashboard';
import MyClasses from '../pages/teacher/MyClasses';
import ClassDetails from '../pages/teacher/ClassDetails';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/assign-teacher" element={<AssignTeacher />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/teacher/classes" element={<MyClasses />} />
      <Route path="/teacher/classes/:id" element={<ClassDetails />} />
    </Routes>
  );
};

export default AppRoutes;
