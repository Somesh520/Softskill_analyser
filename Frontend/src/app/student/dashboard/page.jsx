"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, BarChart, BookOpen, User, Book, Award, Clock, AlertCircle } from 'lucide-react';
import NeoBrutalismCard from '../../../components/ui/NeoBrutalismCard';
import Skeleton from '@mui/material/Skeleton';
import { getStudentDashboardSummary } from '../../../api/studentApi';
import { useAuth } from '../../../context/AuthContext';

const StudentDashboard = () => {
  const router = useRouter();
  const { user: studentData } = useAuth();
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
      <div className="space-y-6">
        <Skeleton variant="rectangular" height={150} className="rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} variant="rectangular" height={140} className="rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl">
        <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
          <AlertCircle size={24} /> Error Loading Dashboard
        </p>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchDashboardSummary}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const statsCards = [
    { label: 'Total Activities', value: summary?.stats.totalActivities.toString() || '0', color: '#3b82f6', icon: BookOpen },
    { label: 'Completed Tasks', value: summary?.stats.submittedActivities.toString() || '0', color: '#10b981', icon: Award },
    { label: 'Pending Tasks', value: summary?.stats.pendingActivities.toString() || '0', color: '#ef4444', icon: Clock },
    { label: 'Avg Skill Score', value: `${summary?.stats.avgScore || 0}%`, color: '#8b5cf6', icon: BarChart },
  ];

  return (
    <div className="space-y-6">
      
      {/* Actual Dashboard Content Below */}
      <div className="space-y-6 pt-4">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 p-8 rounded-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
          <h2 className="text-3xl font-bold mb-3 text-foreground relative z-10">
            Hello, {summary?.student.name || (studentData && studentData.name) || 'Student'}!
          </h2>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-foreground/70 relative z-10">
            <span>Roll No: {summary?.student.rollNo || 'N/A'}</span>
            <span>•</span>
            <span>Class: {summary?.student.className || 'N/A'}</span>
            <span>•</span>
            <span>Semester: {summary?.student.semester || 'N/A'}</span>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg text-white" style={{ backgroundColor: card.color }}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">{card.label}</p>
                </div>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Class & Teacher Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border p-6 rounded-xl shadow-sm" 
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-500" /> Assigned Teacher
            </h3>
            {summary?.teacher ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Teacher Name</p>
                  <p className="text-md font-semibold">{summary.teacher.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-md">{summary.teacher.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</p>
                  <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded px-2 py-1 text-xs font-semibold mt-1">
                    {Array.isArray(summary.teacher.deptName) ? summary.teacher.deptName.join(', ') : summary.teacher.deptName}
                  </span>
                </div>
              </div>
            ) : (
              <p className="font-medium text-gray-500 text-sm">No teacher assigned to your class yet.</p>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border p-6 rounded-xl shadow-sm" 
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Book size={20} className="text-green-500" /> My Enrolled Class
            </h3>
            {summary?.student.className !== 'Not Assigned' ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Class Section</p>
                  <p className="text-md font-semibold">{summary.student.className}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Semester</p>
                  <p className="text-md">Semester {summary.student.semester}</p>
                </div>
                <div className="pt-2">
                  <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded px-2 py-1 text-xs font-semibold">
                    Active Academic Year
                  </span>
                </div>
              </div>
            ) : (
              <p className="font-medium text-gray-500 text-sm">You are not enrolled in any class yet.</p>
            )}
          </motion.div>
        </div>

        {/* Dashboard Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          <motion.div onClick={() => router.push('/student/my-reports')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="My Reports" 
              icon={<FileText className="w-6 h-6" />} 
              color="#8b5cf6"
            >
              View your semester-wise soft skill performance reports with detailed activity grades and feedback.
            </NeoBrutalismCard>
          </motion.div>

          <motion.div onClick={() => router.push('/student/semester-report')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="Semester Report" 
              icon={<BarChart className="w-6 h-6" />} 
              color="#06b6d4"
            >
              Analyze your skill breakdown with interactive radar charts & bar graphs.
            </NeoBrutalismCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
