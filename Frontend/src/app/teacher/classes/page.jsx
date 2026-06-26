"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Users, ArrowRight, Plus, X, BookOpen, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClasses, createClass, deleteClass } from '../../../api/teacherApi';

const MyClasses = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
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

  // Colors for cards
  const cardColors = ['#00FFFF', '#FFEB3B', '#00FF00', '#FF00FF'];

  // Fetch classes via TanStack Query
  const { data: classes = [], isLoading: loading } = useQuery({
    queryKey: ['teacherClasses'],
    queryFn: getClasses,
  });

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
      alert(err.message || 'Failed to delete class');
    }
  });

  const handleCreateClass = (e) => {
    e.preventDefault();
    setError('');
    createClassMutation.mutate(formData);
  };

  const handleDeleteClass = (e, classId) => {
    e.stopPropagation(); // Prevent navigating to class details
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      deleteClassMutation.mutate(classId);
    }
  };

  const formLoading = createClassMutation.isPending;

  return (
    <div className="flex flex-col flex-1 h-full w-full">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 bg-white border-8 border-black p-8 flex items-center justify-between gap-6"
          style={{ boxShadow: '16px 16px 0px #000' }}
        >
          <div className="flex items-center gap-6">
            <div className="bg-[#00FFFF] p-4 border-4 border-black text-black" style={{ boxShadow: '4px 4px 0px #000' }}>
              <FolderOpen size={48} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase mb-1 leading-none tracking-tight text-black">My Classes</h2>
              <p className="text-base font-bold text-black uppercase tracking-widest text-opacity-60 bg-[#FFEB3B] inline-block px-2 border-2 border-black mt-2">
                Select a class to view and evaluate assigned students.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-10 text-black">
          {/* Create Class Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-[#00FF00] border-8 border-black p-6 cursor-pointer flex flex-col justify-center items-center text-center min-h-[250px]"
            style={{ boxShadow: `8px 8px 0px #000` }}
          >
            <div className="bg-white p-4 border-4 border-black rounded-full mb-4" style={{ boxShadow: '4px 4px 0px #000' }}>
              <Plus size={40} strokeWidth={3} className="text-black" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Create New Class</h3>
            <p className="text-black font-bold uppercase mt-2">Add a new batch of students</p>
          </motion.div>

          {loading ? (
            <div className="col-span-full text-center py-10 font-black uppercase text-xl text-black">Loading Classes...</div>
          ) : classes.length === 0 ? (
             <div className="col-span-2 text-center py-10 font-black uppercase text-xl text-gray-500">No classes found. Create one!</div>
          ) : (
            classes.map((cls, idx) => {
              const color = cardColors[idx % cardColors.length];
              return (
                <motion.div 
                  key={cls._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => router.push(`/teacher/classes/${cls._id}`)}
                  className="bg-white border-8 border-black p-6 cursor-pointer flex flex-col justify-between min-h-[250px] text-black"
                  style={{ boxShadow: `8px 8px 0px #000` }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span 
                        className="text-sm font-black px-3 py-1 uppercase tracking-widest border-4 border-black text-black"
                        style={{ backgroundColor: color }}
                      >
                        Sem {cls.semester} | Sec {cls.section}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="bg-black p-2 border-2 border-black text-white">
                          <Users size={24} />
                        </div>
                        <button 
                          onClick={(e) => handleDeleteClass(e, cls._id)}
                          className="bg-[#FF0000] p-2 border-2 border-black text-white hover:bg-black transition-colors group cursor-pointer"
                          title="Delete Class"
                        >
                          <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black uppercase mb-2 leading-tight">{cls.name}</h3>
                    <p className="text-sm font-bold text-gray-600 uppercase mb-1">{cls.program} - {cls.branch}</p>
                    <p className="text-sm font-bold text-gray-600 uppercase">Year: {cls.academicYear}</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t-4 border-black flex items-center justify-between group">
                    <span className="font-black uppercase tracking-wide">View Class Details</span>
                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Create Class Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white border-8 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto text-black"
                style={{ boxShadow: '16px 16px 0px #000' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b-4 border-black bg-[#FFEB3B]">
                  <h2 className="text-3xl font-black uppercase">Create New Class</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="bg-white border-4 border-black p-1 hover:bg-[#FF00FF] hover:text-white transition-colors cursor-pointer"
                    style={{ boxShadow: '4px 4px 0px #000' }}
                  >
                    <X size={24} strokeWidth={3} />
                  </button>
                </div>

                <form onSubmit={handleCreateClass} className="p-6 space-y-6">
                  {error && (
                    <div className="bg-[#FF0000] text-white font-black uppercase p-3 border-4 border-black text-sm" style={{ boxShadow: '4px 4px 0px #000' }}>
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Class Name */}
                    <div className="col-span-full">
                      <label className="block text-lg font-black uppercase mb-2">Class Display Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. B.Tech CSE 5th Sem Section A"
                        className="w-full bg-[#f8f8f8] border-4 border-black px-4 py-3 text-lg font-bold focus:outline-none focus:bg-[#00FFFF] transition-colors text-black"
                        style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }}
                      />
                    </div>

                    {/* Program */}
                    <div>
                      <label className="block text-lg font-black uppercase mb-2">Program</label>
                      <input 
                        type="text" 
                        required
                        value={formData.program}
                        onChange={e => setFormData({...formData, program: e.target.value})}
                        placeholder="e.g. B.Tech, MBA"
                        className="w-full bg-[#f8f8f8] border-4 border-black px-4 py-3 text-lg font-bold focus:outline-none focus:bg-[#00FFFF] transition-colors text-black"
                        style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }}
                      />
                    </div>

                    {/* Branch */}
                    <div>
                      <label className="block text-lg font-black uppercase mb-2">Branch / Specialization</label>
                      <select 
                        required
                        value={formData.branch}
                        onChange={e => setFormData({...formData, branch: e.target.value})}
                        className="w-full bg-[#f8f8f8] border-4 border-black px-4 py-3 text-lg font-bold focus:outline-none focus:bg-[#00FFFF] transition-colors text-black cursor-pointer appearance-none"
                        style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }}
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
                      <label className="block text-lg font-black uppercase mb-2">Semester</label>
                      <input 
                        type="number" 
                        required min="1" max="8"
                        value={formData.semester}
                        onChange={e => setFormData({...formData, semester: e.target.value})}
                        placeholder="1 - 8"
                        className="w-full bg-[#f8f8f8] border-4 border-black px-4 py-3 text-lg font-bold focus:outline-none focus:bg-[#00FFFF] transition-colors text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }}
                      />
                    </div>

                    {/* Section */}
                    <div>
                      <label className="block text-lg font-black uppercase mb-2">Section</label>
                      <input 
                        type="text" 
                        required
                        value={formData.section}
                        onChange={e => setFormData({...formData, section: e.target.value})}
                        placeholder="e.g. A, B, C"
                        className="w-full bg-[#f8f8f8] border-4 border-black px-4 py-3 text-lg font-bold focus:outline-none focus:bg-[#00FFFF] transition-colors text-black"
                        style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }}
                      />
                    </div>

                    {/* Academic Year */}
                    <div className="col-span-full">
                      <label className="block text-lg font-black uppercase mb-2">Academic Year</label>
                      <input 
                        type="text" 
                        required
                        value={formData.academicYear}
                        onChange={e => setFormData({...formData, academicYear: e.target.value})}
                        placeholder="2024-25"
                        className="w-full bg-[#f8f8f8] border-4 border-black px-4 py-3 text-lg font-bold focus:outline-none focus:bg-[#00FFFF] transition-colors text-black"
                        style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }}
                      />
                    </div>
                  </div>

                  <motion.button 
                    whileHover={!formLoading ? { scale: 1.02, x: -4, y: -4, boxShadow: '8px 8px 0px #000' } : {}}
                    whileTap={!formLoading ? { scale: 0.98, x: 0, y: 0, boxShadow: '0px 0px 0px #000' } : {}}
                    className={`w-full bg-[#00FF00] text-black font-black text-xl uppercase border-4 border-black py-4 mt-4 flex justify-center items-center gap-3 transition-all ${formLoading ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'cursor-pointer hover:bg-[#FFEB3B]'}`}
                    style={{ boxShadow: formLoading ? '0px 0px 0px #000' : '6px 6px 0px #000' }}
                    type="submit"
                    disabled={formLoading}
                  >
                    {formLoading ? 'Creating...' : 'Create Class'}
                  </motion.button>
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
