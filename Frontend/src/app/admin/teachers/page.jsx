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
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40, rotate: -2 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="bg-white border-8 border-black w-full max-w-md p-8 relative text-black"
        style={{ boxShadow: '16px 16px 0px #000' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 bg-black text-white p-1 hover:bg-[#FF0000] transition-colors border-4 border-black cursor-pointer"
        >
          <X strokeWidth={3} size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#FF0000] border-8 border-black p-4" style={{ boxShadow: '6px 6px 0px #000' }}>
            <AlertTriangle strokeWidth={3} size={40} className="text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-black uppercase text-center mb-2 leading-tight">
          Are You Sure?
        </h2>
        <p className="text-center font-bold uppercase text-sm mb-2 text-gray-600">
          You are about to permanently remove:
        </p>
        <div className="bg-[#FFEB3B] border-4 border-black p-4 mb-6 text-center">
          <p className="text-xl font-black uppercase">{teacher.name}</p>
          <p className="font-bold text-sm">{teacher.email}</p>
          <p className="font-bold text-sm text-gray-600">{Array.isArray(teacher.deptName) ? teacher.deptName.join(', ') : teacher.deptName}</p>
        </div>
        <p className="text-center font-black uppercase text-sm text-[#FF0000] mb-8 border-4 border-[#FF0000] border-dashed p-3">
          ⚠ This action cannot be undone!
        </p>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-white border-4 border-black py-3 font-black uppercase hover:bg-[#F0F0F0] transition-all disabled:opacity-50 cursor-pointer"
            style={{ boxShadow: '4px 4px 0px #000' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-[#FF0000] border-4 border-black py-3 font-black uppercase text-white hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            style={{ boxShadow: '4px 4px 0px #000' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <><Trash2 strokeWidth={3} size={18} /> Yes, Remove</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── Teacher Info (Students List) Dialog Component ──────────────────────────────
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
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white border-8 border-black w-full max-w-2xl max-h-[80vh] flex flex-col relative text-black"
        style={{ boxShadow: '16px 16px 0px #000' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#00FFFF] p-6 border-b-8 border-black flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-black uppercase leading-tight line-clamp-1">{teacher.name}'s</h2>
            <p className="text-xl font-bold uppercase text-black/70">Assigned Students</p>
          </div>
          <button
            onClick={onClose}
            className="bg-black text-white p-2 hover:bg-[#FF0000] transition-colors border-4 border-black cursor-pointer"
          >
            <X strokeWidth={3} size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#F0F0F0]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-8 border-black border-t-[#00FFFF] animate-spin mb-4" />
              <p className="font-black uppercase">Loading Students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white border-4 border-black p-8 text-center text-gray-500" style={{ boxShadow: '8px 8px 0px #000' }}>
              <p className="text-2xl font-black uppercase text-black mb-2">No Students</p>
              <p className="font-bold uppercase">This teacher hasn't been assigned any students yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {students.map(student => (
                <div key={student._id} className="bg-white border-4 border-black p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all" style={{ boxShadow: '4px 4px 0px #000' }}>
                  <div>
                    <h4 className="text-lg font-black uppercase text-black">{student.name}</h4>
                    <p className="font-bold text-sm text-gray-600">{student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {student.classId && <span className="bg-[#FFEB3B] border-2 border-black px-2 py-1 text-xs font-black uppercase shrink-0">Class: {student.classId.name || 'N/A'}</span>}
                    {student.semester && <span className="bg-[#00FF00] border-2 border-black px-2 py-1 text-xs font-black uppercase shrink-0">Sem: {student.semester}</span>}
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
  const [teacherToRemove, setTeacherToRemove] = useState(null); // teacher object for confirmation
  const [teacherForInfo, setTeacherForInfo] = useState(null); // teacher object for info modal
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
    <div className="min-h-screen bg-[#F0F0F0] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 border-4 border-black font-black uppercase text-sm flex items-center gap-3 ${toast.type === 'success' ? 'bg-[#00FF00] text-black' : 'bg-[#FF0000] text-white'}`}
              style={{ boxShadow: '6px 6px 0px #000' }}
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center gap-2 font-black uppercase bg-white border-4 border-black px-4 py-2 mb-4 hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all cursor-pointer text-black"
              style={{ boxShadow: '4px 4px 0px #000' }}
            >
              <ArrowLeft strokeWidth={3} size={20} /> Dashboard
            </button>
            <h1 className="text-5xl font-black uppercase leading-none tracking-tighter text-black">
              Manage <br /><span className="text-[#FF00FF]">Teachers</span>
            </h1>
            <p className="font-bold mt-2 uppercase text-sm text-gray-600">
              {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} total
            </p>
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-wrap gap-4">
            <button
              onClick={fetchTeachers}
              disabled={loading}
              className="bg-[#00FFFF] border-4 border-black p-4 hover:rotate-3 transition-all disabled:opacity-50 cursor-pointer text-black"
              style={{ boxShadow: '6px 6px 0px #000' }}
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} strokeWidth={3} />
            </button>
            <button
              onClick={() => router.push('/admin/assign-teacher')}
              className="bg-[#00FF00] border-4 border-black px-6 py-4 font-black uppercase text-xl flex items-center gap-2 hover:-translate-y-1 transition-all cursor-pointer text-black"
              style={{ boxShadow: '8px 8px 0px #000' }}
            >
              <UserPlus strokeWidth={3} /> Add Teacher
            </button>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="relative mb-8">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black">
            <Search strokeWidth={4} size={24} />
          </div>
          <input
            type="text"
            placeholder="SEARCH BY NAME, EMAIL OR DEPARTMENT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-8 border-black p-6 pl-16 text-2xl font-black uppercase placeholder:text-gray-400 focus:outline-none focus:bg-[#FFFF00] transition-colors text-black"
            style={{ boxShadow: '12px 12px 0px #000' }}
          />
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 border-8 border-black border-t-[#FF00FF] animate-spin mb-4" />
            <p className="text-2xl font-black uppercase text-black">Loading Teachers...</p>
          </div>
        ) : error ? (
          <div className="bg-[#FF0000] border-8 border-black p-12 text-center" style={{ boxShadow: '16px 16px 0px #000' }}>
            <h2 className="text-4xl font-black uppercase text-white mb-4">Error!</h2>
            <p className="text-xl font-bold uppercase mb-8 text-white">{error}</p>
            <button onClick={fetchTeachers} className="bg-white border-4 border-black px-8 py-3 font-black uppercase hover:bg-black hover:text-white transition-all cursor-pointer text-black">
              Try Again
            </button>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white border-8 border-black p-12 text-center text-black" style={{ boxShadow: '16px 16px 0px #000' }}>
            <Users size={64} strokeWidth={2} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-4xl font-black uppercase mb-4">No Teachers Found</h2>
            <p className="text-xl font-bold uppercase text-gray-500">
              {searchTerm ? 'Try adjusting your search.' : 'Add your first teacher!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher, index) => (
              <motion.div
                key={teacher._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border-8 border-black p-6 hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all group relative overflow-hidden text-black"
                style={{ boxShadow: '12px 12px 0px #000' }}
              >
                <div className="absolute top-[-20px] right-[-20px] w-16 h-16 bg-[#FFFF00] border-4 border-black rotate-45 group-hover:bg-[#FF00FF] transition-colors" />

                <h3 className="text-2xl font-black uppercase mb-4 line-clamp-1">{teacher.name}</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-[#F0F0F0] border-4 border-black p-3 font-bold text-sm">
                    <Mail size={18} strokeWidth={3} className="text-[#FF00FF] shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#F0F0F0] border-4 border-black p-3 font-bold text-sm">
                    <Building size={18} strokeWidth={3} className="text-[#00FFFF] shrink-0" />
                    <span>{Array.isArray(teacher.deptName) ? teacher.deptName.join(', ') : (teacher.deptName || 'N/A')}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#F0F0F0] border-4 border-black p-3 font-bold text-sm">
                    <Calendar size={18} strokeWidth={3} className="text-[#00FF00] shrink-0" />
                    <span>Joined {new Date(teacher.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t-4 border-black border-dashed flex gap-3">
                  <button
                    onClick={() => setTeacherForInfo(teacher)}
                    className="w-12 h-12 bg-[#00FFFF] text-black font-black flex items-center justify-center border-4 border-black hover:bg-black hover:text-white transition-all cursor-pointer shrink-0"
                    style={{ boxShadow: '4px 4px 0px #000' }}
                    title="View Students"
                  >
                    <Info strokeWidth={3} size={20} />
                  </button>
                  <button
                    onClick={() => setTeacherToRemove(teacher)}
                    className="flex-1 bg-[#FF0000] text-white font-black uppercase h-12 border-4 border-black hover:bg-black transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                    style={{ boxShadow: '4px 4px 0px #000' }}
                  >
                    <Trash2 strokeWidth={3} size={16} /> Remove
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
