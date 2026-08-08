"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Users, Mail, Building, Calendar, ArrowLeft, RefreshCw, UserPlus, Search, Trash2, AlertTriangle, X, Info } from 'lucide-react';
import { getTeachers, deleteTeacher, getStudents } from '../../../api/adminApi';

// ── Confirmation Popup Component ─────────────────────────────────────────────
const ConfirmDialog = ({ teacher, onConfirm, onCancel, loading }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-2xl shadow-lg w-full max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors p-2"
        >
          <X strokeWidth={2.5} size={20} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <AlertTriangle strokeWidth={2.5} size={40} className="text-red-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-foreground">
          Remove Teacher?
        </h2>
        <p className="text-center font-medium text-sm mb-6 text-foreground/60">
          You are about to permanently remove:
        </p>
        
        <div className="bg-background border border-border rounded-xl p-4 mb-6 text-center">
          <p className="text-lg font-bold text-foreground">{teacher.name}</p>
          <p className="font-medium text-sm text-foreground/70">{teacher.email}</p>
          <p className="font-medium text-xs text-foreground/50 mt-1">{Array.isArray(teacher.deptName) ? teacher.deptName.join(', ') : teacher.deptName}</p>
        </div>

        <p className="text-center font-semibold text-xs text-red-500 mb-8 uppercase tracking-widest">
          This action cannot be undone
        </p>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-background border border-border rounded-xl py-3 font-semibold hover:bg-foreground/5 transition-all text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 border border-red-600 rounded-xl py-3 font-semibold text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <><Trash2 strokeWidth={2.5} size={18} /> Remove</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── Teacher Info Dialog Component ──────────────────────────────
const TeacherInfoDialog = ({ teacher, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterStudents = async () => {
      try {
        const allStudents = await getStudents();
        const teacherStudents = allStudents.filter(s => s.assignedByTeacher?._id === teacher._id);
        setStudents(teacherStudents);
      } catch (err) {
        console.error("Failed to fetch students", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndFilterStudents();
  }, [teacher._id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-2xl shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary/10 border-b border-border p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{teacher.name}'s</h2>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest">Assigned Students</p>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground transition-colors p-2"
          >
            <X strokeWidth={2.5} size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-background/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin mb-4" />
              <p className="font-semibold text-foreground/60">Loading Students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center" >
              <p className="text-xl font-bold text-foreground mb-2">No Students</p>
              <p className="text-foreground/60 font-medium">This teacher hasn't been assigned any students yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {students.map(student => (
                <div key={student._id} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/50 transition-colors" >
                  <div>
                    <h4 className="text-lg font-bold text-foreground">{student.name}</h4>
                    <p className="font-medium text-sm text-foreground/60">{student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {student.classId && <span className="bg-primary/10 text-primary border border-primary/20 rounded-lg px-2.5 py-1 text-xs font-bold uppercase">Class: {student.classId.name || 'N/A'}</span>}
                    {student.semester && <span className="bg-foreground/5 text-foreground/80 border border-border rounded-lg px-2.5 py-1 text-xs font-bold uppercase">Sem: {student.semester}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ManageTeachers = () => {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherToRemove, setTeacherToRemove] = useState(null);
  const [teacherForInfo, setTeacherForInfo] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await getTeachers();
      setTeachers(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleRemoveConfirm = async () => {
    setRemoving(true);
    try {
      await deleteTeacher(teacherToRemove._id);
      setTeachers(prev => prev.filter(t => t._id !== teacherToRemove._id));
      showToast(`${teacherToRemove.name} has been removed successfully.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to remove teacher.', 'error');
    } finally {
      setRemoving(false);
      setTeacherToRemove(null);
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(t.deptName) ? t.deptName.join(', ') : (t.deptName || '')).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 border rounded-xl shadow-lg font-semibold text-sm flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600'}`}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Dialog */}
        {teacherToRemove && (
          <ConfirmDialog
            teacher={teacherToRemove}
            onConfirm={handleRemoveConfirm}
            onCancel={() => setTeacherToRemove(null)}
            loading={removing}
          />
        )}

        {/* Teacher Info Dialog */}
        <AnimatePresence>
          {teacherForInfo && (
            <TeacherInfoDialog 
              teacher={teacherForInfo} 
              onClose={() => setTeacherForInfo(null)} 
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center gap-2 font-semibold text-sm bg-card border border-border rounded-xl shadow-sm px-4 py-2 mb-6 hover:bg-foreground/5 transition-colors text-foreground"
            >
              <ArrowLeft size={18} /> Dashboard
            </button>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl text-primary border border-primary/20">
                <Users size={40} strokeWidth={2.5} />
              </div>
              <div>
                Manage Teachers
              </div>
            </h1>
            <p className="font-medium mt-2 text-sm text-foreground/60 uppercase tracking-widest">
              {teachers.length} active teacher{teachers.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-wrap gap-4">
            <button
              onClick={fetchTeachers}
              disabled={loading}
              className="bg-card border border-border rounded-xl shadow-sm p-4 hover:bg-foreground/5 transition-colors disabled:opacity-50 text-foreground"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={24} />
            </button>
            <button
              onClick={() => router.push('/admin/assign-teacher')}
              className="bg-primary text-primary-foreground border border-primary/50 rounded-xl shadow-md px-6 py-4 font-bold text-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <UserPlus size={22} /> Add Teacher
            </button>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/40">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Search by name, email or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl shadow-sm p-5 pl-16 text-lg font-medium placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
          />
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin mb-6" />
            <p className="text-xl font-bold text-foreground/80">Loading Teachers...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl shadow-sm p-12 text-center" >
            <h2 className="text-3xl font-bold text-red-500 mb-4">Error!</h2>
            <p className="text-lg font-medium mb-8 text-red-500/80">{error}</p>
            <button onClick={fetchTeachers} className="bg-card border border-border rounded-xl shadow-sm px-8 py-3 font-bold hover:bg-foreground/5 transition-colors text-foreground">
              Try Again
            </button>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-16 text-center" >
            <div className="bg-foreground/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={48} strokeWidth={2} className="text-foreground/40" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">No Teachers Found</h2>
            <p className="text-lg font-medium text-foreground/60">
              {searchTerm ? 'Try adjusting your search query.' : 'Add your first teacher!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            {filteredTeachers.map((teacher, index) => (
              <motion.div
                key={teacher._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col hover:border-primary/50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{teacher.name}</h3>
                  <div className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/20 shrink-0">
                    <Users size={20} />
                  </div>
                </div>

                <div className="space-y-3 flex-1 mb-8">
                  <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                    <Mail size={16} className="text-foreground/40 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                    <Building size={16} className="text-foreground/40 shrink-0" />
                    <span className="truncate">{Array.isArray(teacher.deptName) ? teacher.deptName.join(', ') : (teacher.deptName || 'N/A')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                    <Calendar size={16} className="text-foreground/40 shrink-0" />
                    <span>Joined {new Date(teacher.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setTeacherForInfo(teacher)}
                    className="w-12 h-12 flex items-center justify-center bg-background border border-border rounded-xl text-foreground hover:bg-foreground/5 transition-colors shrink-0"
                    title="View Students"
                  >
                    <Info size={20} />
                  </button>
                  <button
                    onClick={() => setTeacherToRemove(teacher)}
                    className="flex-1 bg-red-500/10 text-red-500 font-semibold border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 size={18} /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTeachers;
