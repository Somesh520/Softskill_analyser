"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Mail, ExternalLink, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getClasses, getClassDetails } from '../../../api/teacherApi';
import { useAuth } from '../../../context/AuthContext';

const AssignedStudents = () => {
  const router = useRouter();
  const { user: teacherData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');

  // Fetch classes via TanStack Query
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['teacherClasses'],
    queryFn: getClasses,
    enabled: !!teacherData });

  // Dependent query: Fetch all student lists in parallel and flatten
  const { data: allStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['teacherStudents', classes.map(c => c._id).join(',')],
    queryFn: async () => {
      if (!classes || classes.length === 0) return [];
      const studentPromises = classes.map(cls => getClassDetails(cls._id));
      const results = await Promise.all(studentPromises);
      
      return results.flatMap(res => 
        res.students.map(s => ({
          ...s,
          className: res.classDetails.name,
          classId: res.classDetails._id
        }))
      );
    },
    enabled: classes.length > 0 });

  const loading = classesLoading || (classes.length > 0 && studentsLoading);

  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (student.rollNo && student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesClass = filterClass === 'All' || student.className === filterClass;
    
    return matchesSearch && matchesClass;
  });

  if (!teacherData) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-card border border-border rounded-2xl shadow-sm p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6">
            <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl text-primary" >
              <Users size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">My All Students</h2>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">
                Unified view of all students across your classes.
              </p>
            </div>
          </div>
          
          <div className="bg-background text-foreground p-4 border border-border rounded-xl shadow-sm flex flex-col items-center min-w-[150px]" >
            <span className="text-4xl font-bold">{allStudents.length}</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground/60 mt-1">Total Enrolled</span>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
            <input 
              type="text"
              placeholder="Search by name, email, or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-xl shadow-sm p-4 pl-12 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors text-foreground placeholder:text-foreground/40"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
            <select 
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full bg-card border border-border rounded-xl shadow-sm p-4 pl-12 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer text-foreground"
            >
              <option value="All">All Classes</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-12" >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="font-semibold text-lg text-foreground/70">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-20 bg-background border border-border rounded-xl border-dashed">
              <p className="font-semibold text-lg text-foreground/50">No students found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-foreground/5 text-foreground/70 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4 border-b border-border/50 rounded-tl-lg">Roll No</th>
                    <th className="p-4 border-b border-border/50">Name</th>
                    <th className="p-4 border-b border-border/50">Class</th>
                    <th className="p-4 border-b border-border/50">Email</th>
                    <th className="p-4 border-b border-border/50 text-right rounded-tr-lg">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      key={student._id} 
                      className="border-b border-border/50 hover:bg-foreground/5 transition-colors text-foreground"
                    >
                      <td className="p-4 font-medium">{student.rollNo || 'N/A'}</td>
                      <td className="p-4 font-bold text-base">{student.name}</td>
                      <td className="p-4">
                        <span className="bg-primary/10 text-primary px-2.5 py-1 border border-primary/20 rounded-md font-semibold text-xs whitespace-nowrap">
                          {student.className}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-sm flex items-center gap-2 text-foreground/80">
                         <Mail size={14} className="text-foreground/40"/> {student.email}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => router.push(`/teacher/classes/${student.classId}`)}
                          className="bg-background border border-border rounded-lg shadow-sm px-4 py-2 font-semibold text-xs flex items-center gap-2 hover:bg-foreground/5 transition-colors ml-auto cursor-pointer text-foreground/80 hover:text-foreground"
                        >
                          View Class <ExternalLink size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssignedStudents;
