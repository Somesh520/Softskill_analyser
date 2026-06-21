"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, BookOpen, Hash, User, ArrowLeft, RefreshCw, Search, Calendar } from 'lucide-react';
import { getStudents } from '../../../api/adminApi';

const ManageStudents = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.assignedByTeacher?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isActive).length;
  const assignedStudents = students.filter(s => s.assignedByTeacher).length;

  return (
    <div className="min-h-screen bg-[#F0F0F0] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center gap-2 font-black uppercase bg-white border-4 border-black px-4 py-2 mb-4 hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all cursor-pointer text-black"
              style={{ boxShadow: '4px 4px 0px #000' }}
            >
              <ArrowLeft strokeWidth={3} size={20} /> Dashboard
            </button>
            <h1 className="text-5xl font-black uppercase leading-none tracking-tighter text-black">
              All <br /><span className="text-[#00FF00]">Students</span>
            </h1>
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <button
              onClick={fetchStudents}
              disabled={loading}
              className="bg-[#00FFFF] border-4 border-black p-4 hover:rotate-3 transition-all disabled:opacity-50 cursor-pointer text-black"
              style={{ boxShadow: '6px 6px 0px #000' }}
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} strokeWidth={3} />
            </button>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-black"
        >
          {[
            { label: 'Total Students', value: totalStudents, color: '#00FF00', icon: <GraduationCap strokeWidth={3} size={28} /> },
            { label: 'Active', value: activeStudents, color: '#00FFFF', icon: <User strokeWidth={3} size={28} /> },
            { label: 'Assigned to Teacher', value: assignedStudents, color: '#FFEB3B', icon: <BookOpen strokeWidth={3} size={28} /> },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white border-8 border-black p-6 flex items-center gap-4"
              style={{ boxShadow: '8px 8px 0px #000', backgroundColor: stat.color }}
            >
              <div className="bg-black text-white p-3 border-4 border-black">{stat.icon}</div>
              <div>
                <p className="text-4xl font-black">{loading ? '—' : stat.value}</p>
                <p className="font-black uppercase text-sm">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black">
            <Search strokeWidth={4} size={24} />
          </div>
          <input
            type="text"
            placeholder="SEARCH BY NAME, EMAIL, ROLL NO OR TEACHER..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-8 border-black p-5 pl-16 text-xl font-black uppercase placeholder:text-gray-400 focus:outline-none focus:bg-[#FFFF00] transition-colors text-black"
            style={{ boxShadow: '12px 12px 0px #000' }}
          />
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 border-8 border-black border-t-[#00FF00] animate-spin mb-4" />
            <p className="text-2xl font-black uppercase text-black">Loading Students...</p>
          </div>
        ) : error ? (
          <div className="bg-[#FF0000] border-8 border-black p-12 text-center" style={{ boxShadow: '16px 16px 0px #000' }}>
            <h2 className="text-4xl font-black uppercase text-white mb-4">Error!</h2>
            <p className="text-xl font-bold uppercase mb-8 text-white">{error}</p>
            <button
              onClick={fetchStudents}
              className="bg-white border-4 border-black px-8 py-3 font-black uppercase hover:bg-black hover:text-white transition-all cursor-pointer text-black"
            >
              Try Again
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white border-8 border-black p-12 text-center text-black" style={{ boxShadow: '16px 16px 0px #000' }}>
            <GraduationCap size={64} strokeWidth={2} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-4xl font-black uppercase mb-4">No Students Found</h2>
            <p className="text-xl font-bold uppercase text-gray-500">
              {searchTerm ? 'Try adjusting your search.' : 'No students have been added yet.'}
            </p>
          </div>
        ) : (
          <>
            <p className="font-black uppercase text-lg mb-4 text-black">
              Showing <span className="bg-black text-white px-2">{filteredStudents.length}</span> students
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 text-black">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-white border-8 border-black p-6 hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all group relative overflow-hidden"
                  style={{ boxShadow: '12px 12px 0px #000' }}
                >
                  {/* Active badge */}
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 font-black uppercase text-xs border-4 border-black ${student.isActive ? 'bg-[#00FF00] text-black' : 'bg-[#FF0000] text-white'}`}
                  >
                    {student.isActive ? 'Active' : 'Inactive'}
                  </div>

                  <h3 className="text-xl font-black uppercase mb-4 pr-20 leading-tight">{student.name}</h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-[#F0F0F0] border-4 border-black p-3 font-bold text-sm">
                      <Mail size={16} strokeWidth={3} className="shrink-0 text-[#FF00FF]" />
                      <span className="truncate">{student.email}</span>
                    </div>

                    {student.rollNo && (
                      <div className="flex items-center gap-3 bg-[#F0F0F0] border-4 border-black p-3 font-bold text-sm">
                        <Hash size={16} strokeWidth={3} className="shrink-0 text-[#FF6600]" />
                        <span>Roll No: {student.rollNo}</span>
                      </div>
                    )}

                    {student.semester && (
                      <div className="flex items-center gap-3 bg-[#F0F0F0] border-4 border-black p-3 font-bold text-sm">
                        <BookOpen size={16} strokeWidth={3} className="shrink-0 text-[#00FFFF]" />
                        <span>Semester {student.semester}</span>
                      </div>
                    )}

                    {student.classId && (
                      <div className="flex items-center gap-3 bg-[#FFEB3B] border-4 border-black p-3 font-bold text-sm">
                        <BookOpen size={16} strokeWidth={3} className="shrink-0" />
                        <span>Class: {student.classId.name || 'N/A'}</span>
                      </div>
                    )}

                    {student.assignedByTeacher ? (
                      <div className="flex items-center gap-3 bg-[#00FFFF] border-4 border-black p-3 font-bold text-sm">
                        <User size={16} strokeWidth={3} className="shrink-0" />
                        <span>Teacher: {student.assignedByTeacher.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-[#F0F0F0] border-4 border-black border-dashed p-3 font-bold text-sm text-gray-500">
                        <User size={16} strokeWidth={3} className="shrink-0" />
                        <span>Unassigned</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 bg-[#F0F0F0] border-4 border-black p-3 font-bold text-sm">
                      <Calendar size={16} strokeWidth={3} className="shrink-0 text-gray-500" />
                      <span>Joined {new Date(student.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
