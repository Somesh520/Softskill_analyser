"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, BookOpen, Hash, User, ArrowLeft, RefreshCw, Search, Calendar, LayoutGrid, List as ListIcon } from 'lucide-react';
import { getStudents } from '../../../api/adminApi';

const ManageStudents = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('ALL'); // 'ALL' or 'BY_TEACHER'

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    const deptString = Array.isArray(s.assignedByTeacher?.deptName) ? s.assignedByTeacher.deptName.join(', ') : (s.assignedByTeacher?.deptName || '');
    
    return (s.name || '').toLowerCase().includes(searchLower) ||
           (s.email || '').toLowerCase().includes(searchLower) ||
           String(s.rollNo || '').toLowerCase().includes(searchLower) ||
           (s.assignedByTeacher?.name || '').toLowerCase().includes(searchLower) ||
           deptString.toLowerCase().includes(searchLower);
  });

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isActive).length;
  const assignedStudents = students.filter(s => s.assignedByTeacher).length;

  const groupedByTeacher = filteredStudents.reduce((acc, student) => {
    const teacherName = student.assignedByTeacher?.name || 'Unassigned';
    if (!acc[teacherName]) acc[teacherName] = [];
    acc[teacherName].push(student);
    return acc;
  }, {});

  const renderStudentCard = (student, index) => (
    <motion.div
      key={student._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min((index % 10) * 0.05, 0.5) }}
      className="bg-card border border-border rounded-2xl shadow-sm p-6 hover:border-primary/50 transition-colors group relative overflow-hidden flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight pr-12">{student.name}</h3>
        <div
          className={`absolute top-5 right-5 px-2.5 py-1 font-bold text-[10px] tracking-wider uppercase rounded-md border ${student.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
        >
          {student.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="space-y-3 flex-1 mb-6">
        <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
          <Mail size={16} className="shrink-0 text-foreground/40" />
          <span className="truncate">{student.email}</span>
        </div>

        {student.rollNo && (
          <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
            <Hash size={16} className="shrink-0 text-foreground/40" />
            <span>Roll No: {student.rollNo}</span>
          </div>
        )}

        {student.semester && (
          <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
            <BookOpen size={16} className="shrink-0 text-foreground/40" />
            <span>Semester {student.semester}</span>
          </div>
        )}

        {student.classId && (
          <div className="flex items-center gap-3 bg-primary/5 p-2 rounded-lg border border-primary/10 text-sm font-medium text-primary">
            <BookOpen size={16} className="shrink-0" />
            <span>Class: {student.classId.name || 'N/A'}</span>
          </div>
        )}

        {student.assignedByTeacher ? (
          <div className="flex items-start gap-3 bg-foreground/5 p-2.5 rounded-lg border border-border text-sm font-medium text-foreground/80">
            <User size={16} className="shrink-0 mt-0.5 text-foreground/50" />
            <div className="flex flex-col">
              <span>Teacher: {student.assignedByTeacher.name}</span>
              <span className="text-xs mt-0.5 opacity-60">Dept: {Array.isArray(student.assignedByTeacher.deptName) ? student.assignedByTeacher.deptName.join(', ') : (student.assignedByTeacher.deptName || 'N/A')}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-background border border-border border-dashed p-2.5 rounded-lg text-sm font-medium text-foreground/50">
            <User size={16} className="shrink-0" />
            <span>Unassigned</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-foreground/50 mt-auto pt-4 border-t border-border/50">
        <Calendar size={14} />
        <span>Joined {new Date(student.createdAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

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
                <GraduationCap size={40} strokeWidth={2.5} />
              </div>
              <div>
                Manage Students
              </div>
            </h1>
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <button
              onClick={fetchStudents}
              disabled={loading}
              className="bg-card border border-border rounded-xl shadow-sm p-4 hover:bg-foreground/5 transition-colors disabled:opacity-50 text-foreground"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={24} />
            </button>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: 'Total Students', value: totalStudents, colorClass: 'text-primary bg-primary/10 border-primary/20', icon: <GraduationCap size={24} strokeWidth={2.5} /> },
            { label: 'Active Students', value: activeStudents, colorClass: 'text-green-500 bg-green-500/10 border-green-500/20', icon: <User size={24} strokeWidth={2.5} /> },
            { label: 'Assigned to Teacher', value: assignedStudents, colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: <BookOpen size={24} strokeWidth={2.5} /> },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl shadow-sm p-6 flex items-center gap-5"
            >
              <div className={`p-4 rounded-xl border ${stat.colorClass}`}>{stat.icon}</div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">{loading ? '—' : stat.value}</p>
                <p className="font-semibold text-sm text-foreground/60">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search & View Toggles */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-6"
        >
          <div className="relative flex-1">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/40">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by name, roll no, dept or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border rounded-2xl shadow-sm p-4 pl-14 text-lg font-medium placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
            />
          </div>

          <div className="flex bg-card border border-border rounded-2xl p-1.5 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('ALL')}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
                viewMode === 'ALL' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              <LayoutGrid size={18} /> All Students
            </button>
            <button
              onClick={() => setViewMode('BY_TEACHER')}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
                viewMode === 'BY_TEACHER' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              <ListIcon size={18} /> By Teacher
            </button>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin mb-6" />
            <p className="text-xl font-bold text-foreground/80">Loading Students...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl shadow-sm p-12 text-center" >
            <h2 className="text-3xl font-bold text-red-500 mb-4">Error!</h2>
            <p className="text-lg font-medium mb-8 text-red-500/80">{error}</p>
            <button
              onClick={fetchStudents}
              className="bg-card border border-border rounded-xl shadow-sm px-8 py-3 font-bold hover:bg-foreground/5 transition-colors text-foreground"
            >
              Try Again
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-16 text-center" >
            <div className="bg-foreground/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap size={48} strokeWidth={2} className="text-foreground/40" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">No Students Found</h2>
            <p className="text-lg font-medium text-foreground/60">
              {searchTerm ? 'Try adjusting your search query.' : 'No students have been added yet.'}
            </p>
          </div>
        ) : (
          <div className="pb-12">
            <p className="font-semibold text-sm mb-6 text-foreground/60">
              Showing <span className="bg-primary/10 text-primary px-2 py-0.5 mx-1 border border-primary/20 rounded-md font-bold">{filteredStudents.length}</span> students
            </p>
            
            {viewMode === 'ALL' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStudents.map((student, index) => renderStudentCard(student, index))}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedByTeacher)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([teacherName, teacherStudents]) => (
                  <div key={teacherName} className="bg-foreground/5 border border-border rounded-2xl shadow-inner p-6 md:p-8" >
                    <h2 className="text-xl font-bold mb-6 bg-card border border-border rounded-xl shadow-sm inline-flex items-center px-5 py-3 text-foreground">
                      <User className="mr-3 text-primary" size={24} />
                      {teacherName} 
                      <span className="bg-primary text-primary-foreground px-2 py-0.5 ml-3 rounded-md text-sm">{teacherStudents.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {teacherStudents.map((student, index) => renderStudentCard(student, index))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
