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
        <Skeleton variant="rectangular" height={150} className="border-8 border-black shadow-[12px_12px_0px_#999] bg-white" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} variant="rectangular" height={140} className="border-[6px] border-black shadow-[8px_8px_0px_#000] bg-white" />
          ))}
        </div>
        <Skeleton variant="rectangular" height={300} className="border-8 border-black shadow-[12px_12px_0px_#000] bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <button 
          onClick={() => router.push(`/teacher/classes/${classId}`)}
          className="mb-6 flex items-center gap-2 font-black uppercase text-xl hover:-translate-y-1 transition-transform bg-white border-4 border-black px-4 py-2 cursor-pointer text-black"
          style={{ boxShadow: '4px 4px 0px #000' }}
        >
          <ArrowLeft strokeWidth={3} size={20} /> Back to Class
        </button>
        <div className="bg-[#FF6B6B] border-8 border-black p-8 shadow-[12px_12px_0px_#000]">
          <p className="text-2xl font-black uppercase text-white mb-4 flex items-center gap-3">
            <AlertCircle size={32} /> Error Loading Report
          </p>
          <p className="text-white font-bold mb-4">{error}</p>
          <button
            onClick={fetchDashboardSummary}
            className="bg-white border-4 border-black p-4 font-black uppercase hover:bg-[#FFEB3B] transition-all cursor-pointer text-black"
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
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10 text-black">
        <button 
          onClick={() => router.push(`/teacher/classes/${classId}`)}
          className="mb-6 flex items-center gap-2 font-black uppercase text-xl hover:-translate-y-1 transition-transform bg-white border-4 border-black px-4 py-2 cursor-pointer text-black"
          style={{ boxShadow: '4px 4px 0px #000' }}
        >
          <ArrowLeft strokeWidth={3} size={20} /> Back to Class
        </button>

        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#00FF00] border-8 border-black p-8 relative overflow-hidden text-black"
          style={{ boxShadow: '12px 12px 0px #000' }}
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 leading-none">
              Report: {summary?.student.name || 'Student'}
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-black uppercase bg-black text-white px-4 py-2 border-2 border-white inline-block mt-2">
              <span>Roll No: {summary?.student.rollNo || 'N/A'}</span>
              <span>•</span>
              <span>Class: {summary?.student.className || 'N/A'}</span>
              <span>•</span>
              <span>Semester: {summary?.student.semester || 'N/A'}</span>
            </div>
            {summary?.student.placement && summary.student.placement.company && (
               <div className="mt-4 flex flex-wrap gap-2 text-sm font-black uppercase bg-[#00FFFF] text-black px-4 py-2 border-2 border-black inline-block">
                 <span>Placement: {summary.student.placement.company}</span>
                 {summary.student.placement.ctc && <span> ({summary.student.placement.ctc})</span>}
               </div>
            )}
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-black">
          {statsCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.1 }}
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

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border-8 border-black p-6" style={{ boxShadow: '8px 8px 0px #000' }}
        >
          <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
            <FileText size={28} /> Activity Submissions
          </h3>
          
          {summary?.activitiesList && summary.activitiesList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-white uppercase text-sm tracking-wider">
                    <th className="p-4 border-b-4 border-black">Activity Title</th>
                    <th className="p-4 border-b-4 border-black">Type</th>
                    <th className="p-4 border-b-4 border-black">Status</th>
                    <th className="p-4 border-b-4 border-black">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.activitiesList.map((act, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={act._id} 
                      className="border-b-4 border-black hover:bg-[#FFEB3B] hover:bg-opacity-40 transition-colors"
                    >
                      <td className="p-4 font-bold uppercase">{act.title}</td>
                      <td className="p-4 font-bold">{act.type}</td>
                      <td className="p-4 font-black uppercase">
                        <span className={`px-2 py-1 border-2 border-black ${act.status === 'Graded' ? 'bg-[#00FF00]' : 'bg-[#FF6B6B] text-white'}`}>
                          {act.status}
                        </span>
                      </td>
                      <td className="p-4 font-black">
                        {act.score !== null ? `${act.score}/${act.maxPoints}` : '-'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="text-center py-10 bg-[#f8f8f8] border-4 border-black border-dashed">
                <p className="font-bold text-lg uppercase text-gray-500">No activities recorded for this student.</p>
             </div>
          )}
        </motion.div>

      </main>
    </div>
  );
};

export default StudentReportView;
