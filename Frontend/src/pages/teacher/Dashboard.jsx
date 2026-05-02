import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, ClipboardCheck } from 'lucide-react';
import NeoBrutalismCard from '../../components/ui/NeoBrutalismCard';
import Sidebar, { SidebarProvider } from '../../components/layout/Sidebar';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!token || !userString) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userString);
    if (user.role && user.role.toLowerCase() !== 'teacher') {
      navigate('/');
      return;
    }

    setTeacherData(user);
  }, [navigate]);

  if (!teacherData) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-[#F0F0F0] overflow-hidden">
        <Sidebar role="teacher" userName={teacherData.name || ''} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {/* Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-white border-8 border-black p-8 md:p-10"
            style={{ boxShadow: '16px 16px 0px #000' }}
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-1 leading-none tracking-tight text-black">Hello, {teacherData.name || 'Teacher'}!</h2>
            <p className="text-base font-bold text-black uppercase tracking-widest text-opacity-60 bg-[#00FF00] inline-block px-2 border-2 border-black mt-2">
              Welcome back. Manage your students, evaluate activities, and track progress.
            </p>
          </motion.div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }} onClick={() => navigate('/teacher/assigned-students')} className="cursor-pointer">
              <NeoBrutalismCard 
                title="My Students" 
                icon={<Users className="w-8 h-8" />} 
                color="#FF00FF"
              >
                View your batch of assigned students, track their profiles, and manage their details.
              </NeoBrutalismCard>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} onClick={() => navigate('/teacher/create-activity')} className="cursor-pointer">
              <NeoBrutalismCard 
                title="Create Activity" 
                icon={<ClipboardCheck className="w-8 h-8" />} 
                color="#00FFFF"
              >
                Set up new soft-skill assessments, assign rubrics, and schedule evaluations.
              </NeoBrutalismCard>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} onClick={() => navigate('/teacher/reports')} className="cursor-pointer">
              <NeoBrutalismCard 
                title="Generate Reports" 
                icon={<FileText className="w-8 h-8" />} 
                color="#FFEB3B"
              >
                Compile semester-end scores, generate detailed performance reports, and analyze data.
              </NeoBrutalismCard>
            </motion.div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TeacherDashboard;