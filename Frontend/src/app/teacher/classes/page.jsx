"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Users, ArrowRight, Plus, X, BookOpen, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClasses, createClass, deleteClass } from '../../../api/teacherApi';
import { useToast } from '../../../context/ToastContext';

const MyClasses = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast, showConfirm } = useToast();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    program: '',
    branch: '',
    semester: '',
    section: '',
    academicYear: '2024-25'
  });
  const [error, setError] = useState('');

  // Fetch classes via TanStack Query
  const { data: classes = [], isLoading: loading } = useQuery({
    queryKey: ['teacherClasses'],
    queryFn: getClasses });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherClasses'] });
      setIsModalOpen(false);
      setFormData({ name: '', program: '', branch: '', semester: '', section: '', academicYear: '2024-25' });
    },
    onError: (err) => {
      setError(err.message || 'Failed to create class');
    }
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherClasses'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to delete class', 'error');
    }
  });

  const handleCreateClass = (e) => {
    e.preventDefault();
    setError('');
    createClassMutation.mutate(formData);
  };

  const handleDeleteClass = async (e, classId) => {
    e.stopPropagation(); // Prevent navigating to class details
    const confirmed = await showConfirm('This will permanently delete this class. This action cannot be undone.');
    if (confirmed) {
      deleteClassMutation.mutate(classId);
    }
  };

  const formLoading = createClassMutation.isPending;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-card border border-border rounded-2xl shadow-sm p-8 flex items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6">
            <div className="bg-primary/10 text-primary p-4 border border-primary/20 rounded-xl" >
              <FolderOpen size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">My Classes</h2>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">
                Select a class to view and evaluate assigned students.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
          {/* Create Class Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-card border border-border border-dashed rounded-2xl shadow-sm p-8 cursor-pointer flex flex-col justify-center items-center text-center min-h-[250px] hover:bg-foreground/5 hover:border-primary/50 transition-colors group"
          >
            <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" >
              <Plus size={32} strokeWidth={2.5} className="text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Create New Class</h3>
            <p className="text-foreground/60 font-medium mt-2">Add a new batch of students</p>
          </motion.div>

          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin mb-4" />
                <p className="text-xl font-bold text-foreground/80">Loading Classes...</p>
            </div>
          ) : classes.length === 0 ? (
             <div className="col-span-2 text-center py-20 flex flex-col items-center">
                 <FolderOpen size={48} className="text-foreground/20 mb-4" />
                 <p className="font-bold text-xl text-foreground/60">No classes found. Create one!</p>
             </div>
          ) : (
            classes.map((cls, idx) => (
                <motion.div 
                  key={cls._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                  whileHover={{ y: -4 }}
                  onClick={() => router.push(`/teacher/classes/${cls._id}`)}
                  className="bg-card border border-border rounded-2xl shadow-sm p-6 cursor-pointer flex flex-col justify-between min-h-[250px] hover:border-primary/50 transition-colors group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold px-3 py-1.5 uppercase tracking-widest border border-border rounded-lg bg-foreground/5 text-foreground/80">
                        Sem {cls.semester} | Sec {cls.section}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                          <Users size={20} />
                        </div>
                        <button 
                          onClick={(e) => handleDeleteClass(e, cls._id)}
                          className="bg-red-500/10 p-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                          title="Delete Class"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 leading-tight text-foreground group-hover:text-primary transition-colors">{cls.name}</h3>
                    <p className="text-sm font-semibold text-foreground/60 uppercase mb-1">{cls.program} - {cls.branch}</p>
                    <p className="text-sm font-semibold text-foreground/60 uppercase">Year: {cls.academicYear}</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-foreground/60 group-hover:text-primary transition-colors">
                    <span className="font-semibold text-sm">View Details</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              )
            )
          )}
        </div>

        {/* Create Class Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ y: 20, scale: 0.95, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 20, scale: 0.95, opacity: 0 }}
                className="bg-card border border-border rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-border bg-primary/5">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Create New Class</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-foreground/50 hover:text-foreground hover:bg-foreground/5 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateClass} className="p-6 space-y-6">
                  {error && (
                    <div className="bg-red-500/10 text-red-500 font-semibold p-4 rounded-xl border border-red-500/20 text-sm" >
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Class Name */}
                    <div className="col-span-full">
                      <label className="block text-sm font-semibold text-foreground/80 mb-2">Class Display Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. B.Tech CSE 5th Sem Section A"
                        className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-foreground/30"
                      />
                    </div>

                    {/* Program */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground/80 mb-2">Program</label>
                      <input 
                        type="text" 
                        required
                        value={formData.program}
                        onChange={e => setFormData({...formData, program: e.target.value})}
                        placeholder="e.g. B.Tech, MBA"
                        className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-foreground/30"
                      />
                    </div>

                    {/* Branch */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground/80 mb-2">Branch / Specialization</label>
                      <select 
                        required
                        value={formData.branch}
                        onChange={e => setFormData({...formData, branch: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground cursor-pointer appearance-none"
                      >
                        <option value="" disabled>Select Branch</option>
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="CSIT">CSIT</option>
                        <option value="CS">CS</option>
                        <option value="CSE AI">CSE AI</option>
                        <option value="CSE-AIML">CSE-AIML</option>
                        <option value="CSE- DATA SCIENCE">CSE- DATA SCIENCE</option>
                        <option value="CSE-CYBER SECURITY">CSE-CYBER SECURITY</option>
                        <option value="ECE">ECE</option>
                        <option value="ECE- VLSI">ECE- VLSI</option>
                        <option value="EEE">EEE</option>
                        <option value="ELCE">ELCE</option>
                        <option value="ME">ME</option>
                        <option value="mechatronics">Mechatronics</option>
                        <option value="AMIA">AMIA (Advanced Mechatronics)</option>
                        <option value="B.Pharma">B.Pharma</option>
                        <option value="MBA">MBA</option>
                        <option value="MCA">MCA</option>
                      </select>
                    </div>

                    {/* Semester */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground/80 mb-2">Semester</label>
                      <input 
                        type="number" 
                        required min="1" max="8"
                        value={formData.semester}
                        onChange={e => setFormData({...formData, semester: e.target.value})}
                        placeholder="1 - 8"
                        className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    {/* Section */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground/80 mb-2">Section</label>
                      <input 
                        type="text" 
                        required
                        value={formData.section}
                        onChange={e => setFormData({...formData, section: e.target.value})}
                        placeholder="e.g. A, B, C"
                        className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-foreground/30"
                      />
                    </div>

                    {/* Academic Year */}
                    <div className="col-span-full">
                      <label className="block text-sm font-semibold text-foreground/80 mb-2">Academic Year</label>
                      <input 
                        type="text" 
                        required
                        value={formData.academicYear}
                        onChange={e => setFormData({...formData, academicYear: e.target.value})}
                        placeholder="2024-25"
                        className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-foreground/30"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={formLoading}
                    className={`w-full bg-primary text-primary-foreground font-bold text-lg rounded-xl shadow-md py-4 mt-8 flex justify-center items-center gap-2 transition-all ${formLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                  >
                    {formLoading ? 'Creating...' : 'Create Class'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default MyClasses;
