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
          <Skeleton key={item} variant="rectangular" height={180} className="rounded-2xl bg-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10 flex flex-col flex-1 h-full w-full bg-background">
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl p-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <AlertCircle size={24} />
             <p className="font-semibold">{error}</p>
          </div>
          <button
            onClick={fetchStudentActivities}
            className="px-4 py-2 bg-background border border-border rounded-lg shadow-sm font-semibold hover:bg-accent transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8 bg-card border border-border rounded-2xl shadow-sm p-8 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none"></div>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
               <div className="flex items-center gap-6">
                 <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl text-primary flex items-center justify-center shrink-0">
                   <FileText size={48} strokeWidth={2} />
                 </div>
                 <div>
                   <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">My Reports</h2>
                   <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">
                     Semester Activities
                   </p>
                 </div>
               </div>
               <button 
                 onClick={fetchStudentActivities}
                 className="bg-card hover:bg-accent border border-border rounded-lg shadow-sm px-4 py-2 font-semibold text-foreground flex items-center gap-2 transition-colors"
               >
                 <RefreshCw size={18} /> Refresh
               </button>
             </div>
          </div>

          {/* Activities List */}
          {activities.length === 0 ? (
            <div className="text-center py-16 border border-border border-dashed rounded-2xl bg-card shadow-sm">
              <FileText size={48} className="mx-auto text-foreground/20 mb-4" />
              <p className="font-bold text-foreground/50 text-xl">No activities found</p>
              <p className="text-foreground/40 font-semibold mt-2">When your teacher assigns activities, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((act, idx) => {
                const isGraded = act.status === 'Graded';
                return (
                  <motion.div
                    key={act._id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md transition-all"
                  >
                    {/* Left Side: Activity Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-primary/10 text-primary border border-primary/20 rounded-md font-semibold text-xs px-3 py-1">
                          {act.type}
                        </span>
                        <span className={`border rounded-md font-semibold text-xs px-3 py-1 ${
                          isGraded ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {act.status}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">
                          {act.title}
                        </h3>
                        <p className="text-foreground/70 text-sm mt-2 leading-relaxed">
                          {act.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-foreground/50">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} /> Due: {new Date(act.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Tag size={14} /> Max Points: {act.maxPoints}
                        </span>
                      </div>

                      {/* Criteria Marks Breakdown (pills) */}
                      {isGraded && Object.keys(act.criteriaMarks).length > 0 && (
                        <div className="pt-4 border-t border-border/50">
                          <p className="text-xs font-semibold text-foreground/50 uppercase mb-3 tracking-wider">Criteria Breakdown</p>
                          <div className="flex flex-wrap gap-2.5">
                            {Object.entries(act.criteriaMarks).map(([crit, mark]) => (
                              <div key={crit} className="bg-background border border-border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                                <span className="font-semibold text-foreground/70">{crit}:</span>
                                <span className="text-primary font-bold">{mark}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Side: Grades & Feedback */}
                    <div className="w-full md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8 flex flex-col justify-between gap-4 shrink-0">
                      <div>
                        <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Your Grade</p>
                        {isGraded ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-5xl font-extrabold text-primary tracking-tight">
                              {act.score}
                            </span>
                            <span className="text-foreground/50 font-bold text-lg">
                              / {act.maxPoints}
                            </span>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-foreground/40 mt-1">Pending</p>
                        )}
                      </div>

                      {isGraded && (
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-sm mt-4">
                          <p className="text-xs font-semibold text-primary uppercase mb-2 flex items-center gap-1.5 tracking-wider">
                            <CheckCircle2 size={14} /> Teacher Feedback
                          </p>
                          <p className="text-foreground/80 italic leading-relaxed">
                            "{act.feedback || 'No feedback provided.'}"
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
      </main>
    </div>
  );
};

export default MyReports;
