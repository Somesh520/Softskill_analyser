"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, BarChart, BookOpen, User, Book, Award, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import Skeleton from '@mui/material/Skeleton';
import { getStudentReport } from '../../../../../../api/teacherApi';

const StudentReportView = () => {
  const router = useRouter();
  const { id: classId, studentId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (classId && studentId) {
      fetchDashboardSummary();
    }
  }, [classId, studentId]);

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentReport(classId, studentId);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load student report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 space-y-8 min-h-[500px]">
        <Skeleton variant="rectangular" height={150} className="bg-card rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} variant="rectangular" height={140} className="bg-card rounded-xl" />
          ))}
        </div>
        <Skeleton variant="rectangular" height={300} className="bg-card rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <button 
          onClick={() => router.push(`/teacher/classes/${classId}`)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Class
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8 rounded-xl border border-red-200 dark:border-red-800/30">
          <p className="text-xl font-semibold mb-4 flex items-center gap-3">
            <AlertCircle size={24} /> Error Loading Report
          </p>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchDashboardSummary}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
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
    <div className="flex flex-col flex-1 h-full w-full">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
        <button 
          onClick={() => router.push(`/teacher/classes/${classId}`)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Class
        </button>

        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-6 lg:p-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {summary?.student.name || 'Student'}'s Report
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/70 mt-3">
              <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">Roll No: {summary?.student.rollNo || 'N/A'}</span>
              <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">Class: {summary?.student.className || 'N/A'}</span>
              <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">Semester: {summary?.student.semester || 'N/A'}</span>
            </div>
            {summary?.student.placement && summary.student.placement.company && (
               <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium bg-green-500/10 text-green-600 px-3 py-1.5 rounded-md">
                 <Award size={16} />
                 <span>Placed at {summary.student.placement.company}</span>
                 {summary.student.placement.ctc && <span>({summary.student.placement.ctc})</span>}
               </div>
            )}
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.1 }}
                className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-foreground/70">{card.label}</p>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-6" 
        >
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FileText size={20} className="text-primary" /> Activity Submissions
          </h3>
          
          {summary?.activitiesList && summary.activitiesList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-foreground/70 uppercase bg-primary/5">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Activity Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.activitiesList.map((act, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={act._id} 
                      className="border-b border-border last:border-0 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-4 py-4 font-medium">{act.title}</td>
                      <td className="px-4 py-4 text-foreground/70">{act.type}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${act.status === 'Graded' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                          {act.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium">
                        {act.score !== null ? `${act.score}/${act.maxPoints}` : '-'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="text-center py-10 border border-dashed border-border rounded-lg">
                <p className="text-sm font-medium text-foreground/50">No activities recorded for this student.</p>
             </div>
          )}
        </motion.div>

      </main>
    </div>
  );
};

export default StudentReportView;
