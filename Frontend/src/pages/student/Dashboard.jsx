import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, BarChart, BookOpen, User, Book, Award, Clock, AlertCircle } from 'lucide-react';
import NeoBrutalismCard from '../../components/ui/NeoBrutalismCard';
import Skeleton from '@mui/material/Skeleton';
import { getStudentDashboardSummary } from '../../api/studentApi';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { userData: studentData } = useOutletContext();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 space-y-8">
        <Skeleton variant="rectangular" height={150} className="border-8 border-black shadow-[12px_12px_0px_#999] bg-white" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} variant="rectangular" height={140} className="border-[6px] border-black shadow-[8px_8px_0px_#000] bg-white" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton variant="rectangular" height={200} className="border-8 border-black shadow-[12px_12px_0px_#000] bg-white" />
          <Skeleton variant="rectangular" height={200} className="border-8 border-black shadow-[12px_12px_0px_#000] bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-[#FF6B6B] border-8 border-black p-8 shadow-[12px_12px_0px_#000]">
          <p className="text-2xl font-black uppercase text-white mb-4 flex items-center gap-3">
            <AlertCircle size={32} /> Error Loading Dashboard
          </p>
          <p className="text-white font-bold mb-4">{error}</p>
          <button
            onClick={fetchDashboardSummary}
            className="bg-white border-4 border-black p-4 font-black uppercase hover:bg-[#FFEB3B] transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    { label: 'Total Activities', value: summary?.stats.totalActivities.toString() || '0', color: '#FFEB3B', icon: BookOpen },
    { label: 'Completed Tasks', value: summary?.stats.submittedActivities.toString() || '0', color: '#00FF00', icon: Award },
    { label: 'Pending Tasks', value: summary?.stats.pendingActivities.toString() || '0', color: '#FF6B6B', icon: Clock },
    { label: 'Avg Skill Score', value: `${summary?.stats.avgScore || 0}%`, color: '#FF00FF', icon: BarChart },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#00FF00] border-8 border-black p-8 relative overflow-hidden"
        style={{ boxShadow: '12px 12px 0px #000' }}
      >
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 leading-none">
            Hello, {summary?.student.name || studentData.name}!
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-black uppercase bg-black text-white px-4 py-2 border-2 border-white inline-block mt-2">
            <span>Roll No: {summary?.student.rollNo || 'N/A'}</span>
            <span>•</span>
            <span>Class: {summary?.student.className || 'N/A'}</span>
            <span>•</span>
            <span>Semester: {summary?.student.semester || 'N/A'}</span>
          </div>
        </div>
      </motion.div>

      {/* Class & Teacher Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-8 border-black p-8" 
          style={{ boxShadow: '12px 12px 0px #000' }}
        >
          <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
            <User size={28} /> Assigned Teacher
          </h3>
          {summary?.teacher ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">TEACHER NAME</p>
                <p className="text-xl font-black uppercase text-black">{summary.teacher.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">EMAIL ADDRESS</p>
                <p className="text-lg font-bold text-black">{summary.teacher.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">DEPARTMENT</p>
                <span className="inline-block bg-[#00FFFF] border-2 border-black font-black uppercase text-xs px-3 py-1 mt-1">
                  {summary.teacher.deptName}
                </span>
              </div>
            </div>
          ) : (
            <p className="font-bold text-gray-500 uppercase">No teacher assigned to your class yet.</p>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-8 border-black p-8" 
          style={{ boxShadow: '12px 12px 0px #000' }}
        >
          <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
            <Book size={28} /> My Enrolled Class
          </h3>
          {summary?.student.className !== 'Not Assigned' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">CLASS SECTION</p>
                <p className="text-xl font-black uppercase text-black">{summary.student.className}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">CURRENT SEMESTER</p>
                <p className="text-lg font-black text-black">Semester {summary.student.semester}</p>
              </div>
              <div className="pt-2">
                <span className="inline-block bg-[#FFEB3B] border-2 border-black font-black uppercase text-xs px-3 py-1">
                  Active Academic Year
                </span>
              </div>
            </div>
          ) : (
            <p className="font-bold text-gray-500 uppercase">You are not enrolled in any class yet.</p>
          )}
        </motion.div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.3 }}
              className="bg-white border-6 border-black p-6 hover:shadow-xl transition-all"
              style={{ boxShadow: '8px 8px 0px #000' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white p-3 border-4 border-black" style={{ backgroundColor: card.color }}>
                  <Icon size={28} className="text-black" strokeWidth={2} />
                </div>
              </div>
              <p className="text-sm font-bold text-gray-600 uppercase">{card.label}</p>
              <p className="text-4xl font-black mt-1">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Dashboard Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div whileHover={{ y: -5 }} onClick={() => navigate('/student/my-reports')} className="cursor-pointer">
          <NeoBrutalismCard 
            title="My Reports" 
            icon={<FileText className="w-8 h-8" />} 
            color="#FF00FF"
          >
            View your semester-wise soft skill performance reports with detailed activity grades and feedback.
          </NeoBrutalismCard>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} onClick={() => navigate('/student/semester-report')} className="cursor-pointer">
          <NeoBrutalismCard 
            title="Semester Report" 
            icon={<BarChart className="w-8 h-8" />} 
            color="#00FFFF"
          >
            Analyze your skill breakdown with interactive radar charts & bar graphs.
          </NeoBrutalismCard>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
