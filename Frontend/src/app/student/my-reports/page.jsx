"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Tag, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Skeleton from '@mui/material/Skeleton';
import { getStudentDashboardSummary } from '../../../api/studentApi';

const MyReports = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentActivities();
  }, []);

  const fetchStudentActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await getStudentDashboardSummary();
      setActivities(summary.activities || []);
    } catch (err) {
      console.error('Failed to fetch student activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 space-y-8 min-h-[500px]">
        <Skeleton variant="text" width="40%" height={60} />
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rectangular" height={180} className="border-8 border-black shadow-[10px_10px_0px_#000] bg-white" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-[#FF6B6B] border-8 border-black p-8 shadow-[12px_12px_0px_#000]">
          <p className="text-2xl font-black uppercase text-white mb-4 flex items-center gap-3">
            <AlertCircle size={32} /> Error Loading Reports
          </p>
          <p className="text-white font-bold mb-4">{error}</p>
          <button
            onClick={fetchStudentActivities}
            className="bg-white border-4 border-black p-4 font-black uppercase hover:bg-[#FFEB3B] transition-all cursor-pointer text-black"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl text-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF00FF] p-3 border-4 border-black text-black" style={{ boxShadow: '4px 4px 0px #000' }}>
              <FileText size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-black">My Reports & Activities</h1>
          </div>
          <button 
            onClick={fetchStudentActivities}
            className="bg-white hover:bg-gray-100 border-4 border-black p-3 font-black text-black flex items-center gap-2 transform active:translate-y-1 transition-all cursor-pointer"
            style={{ boxShadow: '4px 4px 0px #000' }}
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        {/* Activities List */}
        {activities.length === 0 ? (
          <div className="bg-white border-8 border-black p-10 text-center" style={{ boxShadow: '12px 12px 0px #000' }}>
            <p className="text-2xl font-black uppercase text-gray-500">No activities found</p>
            <p className="text-gray-500 font-bold uppercase mt-2">When your teacher assigns activities or updates marks, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {activities.map((act, idx) => {
              const isGraded = act.status === 'Graded';
              return (
                <motion.div
                  key={act._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border-8 border-black p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-2xl transition-all"
                  style={{ boxShadow: '12px 12px 0px #000' }}
                >
                  {/* Left Side: Activity Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-[#FFEB3B] border-2 border-black font-black uppercase text-xs px-3 py-1 text-black">
                        {act.type}
                      </span>
                      <span className={`border-2 border-black font-black uppercase text-xs px-3 py-1 ${
                        isGraded ? 'bg-[#00FF00] text-black' : 'bg-[#FF9800] text-black'
                      }`}>
                        {act.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-black">
                        {act.title}
                      </h3>
                      <p className="text-gray-700 font-bold text-sm mt-1">
                        {act.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-gray-500 uppercase">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} /> Due: {new Date(act.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Tag size={14} /> Max Points: {act.maxPoints}
                      </span>
                    </div>

                    {/* Criteria Marks Breakdown (pills) */}
                    {isGraded && Object.keys(act.criteriaMarks).length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Criteria Breakdown</p>
                        <div className="flex flex-wrap gap-2.5">
                          {Object.entries(act.criteriaMarks).map(([crit, mark]) => (
                            <div key={crit} className="bg-gray-100 border-2 border-black px-3 py-1.5 flex items-center gap-2 font-bold text-xs uppercase text-black">
                              <span className="font-black text-black">{crit}:</span>
                              <span className="text-[#FF00FF] font-black">{mark}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Grades & Feedback */}
                  <div className="w-full md:w-80 border-t-4 md:border-t-0 md:border-l-4 border-black pt-6 md:pt-0 md:pl-8 flex flex-col justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">YOUR GRADE</p>
                      {isGraded ? (
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-5xl font-black text-[#FF00FF]">
                            {act.score}
                          </span>
                          <span className="text-gray-500 font-bold">
                            / {act.maxPoints}
                          </span>
                        </div>
                      ) : (
                        <p className="text-3xl font-black text-gray-400 mt-1 uppercase">Pending</p>
                      )}
                    </div>

                    {isGraded && (
                      <div className="bg-gray-50 border-2 border-black p-4 font-bold text-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5 text-black">
                          <CheckCircle2 size={14} className="text-[#00FF00]" /> Teacher Feedback
                        </p>
                        <p className="text-black italic">
                          {act.feedback || 'No feedback provided.'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyReports;
