import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, BarChart, BookOpen } from 'lucide-react';
import NeoBrutalismCard from '../../components/ui/NeoBrutalismCard';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { userData: studentData } = useOutletContext();

  return (
    <div className="p-6 lg:p-10">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 bg-[#00FF00] border-8 border-black p-8"
        style={{ boxShadow: '12px 12px 0px #000' }}
      >
        <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">Hello, {studentData.name || 'Student'}!</h2>
        <p className="text-xl font-bold">Track your soft-skill performance, view reports, and monitor your growth.</p>
      </motion.div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <motion.div whileHover={{ y: -5 }} onClick={() => navigate('/student/my-reports')} className="cursor-pointer">
          <NeoBrutalismCard 
            title="My Reports" 
            icon={<FileText className="w-8 h-8" />} 
            color="#FF00FF"
          >
            View your semester-wise soft skill performance reports with detailed breakdowns.
          </NeoBrutalismCard>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} onClick={() => navigate('/student/semester-report')} className="cursor-pointer">
          <NeoBrutalismCard 
            title="Semester Report" 
            icon={<BarChart className="w-8 h-8" />} 
            color="#00FFFF"
          >
            Analyze your scores with radar charts & bar graphs across communication, teamwork, and more.
          </NeoBrutalismCard>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} onClick={() => navigate('/student/courses')} className="cursor-pointer">
          <NeoBrutalismCard 
            title="My Courses" 
            icon={<BookOpen className="w-8 h-8" />} 
            color="#FFEB3B"
          >
            View your enrolled classes, assigned teachers, and current semester activities.
          </NeoBrutalismCard>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
