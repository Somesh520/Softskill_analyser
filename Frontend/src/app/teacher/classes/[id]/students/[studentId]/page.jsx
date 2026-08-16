"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BarChart, BookOpen, User, Book, Award, Clock, AlertCircle, ArrowLeft, Edit2, X, Loader2 } from 'lucide-react';
import Skeleton from '@mui/material/Skeleton';
import { getStudentReport, editActivityMarks } from '../../../../../../api/teacherApi';

const StudentReportView = () => {
  const router = useRouter();
  const { id: classId, studentId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editMarks, setEditMarks] = useState({});
  const [editFeedback, setEditFeedback] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const handleOpenEditModal = (act) => {
    setSelectedActivity(act);
    setEditMarks(act.criteriaMarks || {});
    setEditFeedback(act.feedback || '');
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditMarksChange = (criterion, val) => {
    setEditMarks({
      ...editMarks,
      [criterion]: val === '' ? '' : Number(val)
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      setEditError('');
      
      const finalMarks = {};
      for (const [criterion, val] of Object.entries(editMarks)) {
        if (val === '') {
          throw new Error(`Please enter score for ${criterion}`);
        }
        const numVal = Number(val);
        if (numVal < 0) {
          throw new Error(`Score for ${criterion} cannot be negative`);
        }
        finalMarks[criterion] = numVal;
      }

      await editActivityMarks(selectedActivity._id, selectedActivity.submissionId, {
        criteriaMarks: finalMarks,
        feedback: editFeedback
      });

      setShowEditModal(false);
      fetchDashboardSummary(); // Refresh list
    } catch (err) {
      setEditError(err.message || 'Failed to update marks');
    } finally {
      setEditLoading(false);
    }
  };

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
          
          {summary?.activities && summary.activities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-foreground/70 uppercase bg-primary/5">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Activity Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.activities.map((act, idx) => (
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
                      <td className="px-4 py-4 text-right">
                        {act.status === 'Graded' ? (
                          <button
                            onClick={() => handleOpenEditModal(act)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 size={13} /> Edit Marks
                          </button>
                        ) : (
                          <span className="text-xs text-foreground/45 italic">Not Graded</span>
                        )}
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

        {/* Edit Marks Modal */}
        <AnimatePresence>
          {showEditModal && selectedActivity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-card shrink-0 text-foreground">
                  <div>
                    <h3 className="text-lg font-bold">Edit Student Marks</h3>
                    <p className="text-xs text-foreground/50 mt-1">{selectedActivity.title}</p>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-1.5 hover:bg-foreground/5 rounded-lg text-foreground/60 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
                  {editError && (
                    <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle size={16} /> {editError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">Criteria Allocation</p>
                    {Object.entries(editMarks).map(([criterion, val]) => (
                      <div key={criterion} className="flex items-center justify-between gap-4 p-3 bg-foreground/5 rounded-xl border border-border">
                        <label className="text-sm font-semibold text-foreground capitalize flex-1 min-w-0 truncate">
                          {criterion}
                        </label>
                        <div className="flex items-center gap-1.5 w-24 shrink-0">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => handleEditMarksChange(criterion, e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                            placeholder="Score"
                            min="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">Teacher Feedback</label>
                    <textarea
                      value={editFeedback}
                      onChange={(e) => setEditFeedback(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none h-24"
                      placeholder="Add feedback about student's performance..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border mt-6 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-background border border-border rounded-xl py-3 font-semibold text-sm hover:bg-foreground/5 transition-colors cursor-pointer text-foreground"
                      disabled={editLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} /> Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default StudentReportView;
