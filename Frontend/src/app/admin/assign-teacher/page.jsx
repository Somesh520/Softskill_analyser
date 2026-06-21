"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Building } from 'lucide-react';
import { createTeacher } from '../../../api/adminApi';
import { useAuth } from '../../../context/AuthContext';

const AssignTeacher = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    deptName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await createTeacher(formData);
      setMessage(response.message || 'Teacher assigned successfully!');
      setFormData({ name: '', email: '', password: '', deptName: '' });
    } catch (err) {
      setError(err.message || 'Failed to assign teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-3xl"
        >
          <div className="bg-white border-8 border-black p-8 md:p-10" style={{ boxShadow: '16px 16px 0px #000' }}>
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-[#FFEB3B] p-3 border-4 border-black" style={{ boxShadow: '4px 4px 0px #000' }}>
                <UserPlus size={32} strokeWidth={2.5} className="text-black" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black">Assign Teacher</h1>
            </div>
            <p className="text-lg font-bold mb-8 text-black uppercase tracking-widest text-opacity-60 bg-[#00FF00] inline-block px-2 border-2 border-black mt-2">
              Create a new teacher account
            </p>

            {message && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#00FF00] text-black font-black uppercase p-4 border-4 border-black mb-6 text-sm flex items-center gap-2" style={{ boxShadow: '4px 4px 0px #000' }}>
                🎉 {message}
              </motion.div>
            )}

            {error && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#FF0000] text-white font-black uppercase p-4 border-4 border-black mb-6 text-sm flex items-center gap-2" style={{ boxShadow: '4px 4px 0px #000' }}>
                ⚠️ {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-black uppercase mb-2 text-black">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10"><UserPlus strokeWidth={2.5} size={20} /></div>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#f8f8f8] border-4 border-black pl-12 pr-4 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all text-black"
                      style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }} placeholder="John Doe" required />
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-black uppercase mb-2 text-black">Department</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10"><Building strokeWidth={2.5} size={20} /></div>
                    <input type="text" value={formData.deptName} onChange={(e) => setFormData({ ...formData, deptName: e.target.value })}
                      className="w-full bg-[#f8f8f8] border-4 border-black pl-12 pr-4 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all text-black"
                      style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }} placeholder="Computer Science" required />
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-black uppercase mb-2 text-black">Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10"><Mail strokeWidth={2.5} size={20} /></div>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#f8f8f8] border-4 border-black pl-12 pr-4 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all text-black"
                      style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }} placeholder="teacher@kiet.edu" required />
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-black uppercase mb-2 text-black">Temporary Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10"><Lock strokeWidth={2.5} size={20} /></div>
                    <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-[#f8f8f8] border-4 border-black pl-12 pr-4 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all text-black"
                      style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }} placeholder="securePassword123" required />
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={!loading ? { scale: 1.02, x: -4, y: -4, boxShadow: '8px 8px 0px #000' } : {}}
                whileTap={!loading ? { scale: 0.98, x: 0, y: 0, boxShadow: '0px 0px 0px #000' } : {}}
                className={`w-full bg-[#FFEB3B] text-black font-black text-xl uppercase border-4 border-black py-4 mt-8 flex justify-center items-center gap-3 transition-all ${loading ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'cursor-pointer hover:bg-[#00FFFF]'}`}
                style={{ boxShadow: loading ? '0px 0px 0px #000' : '6px 6px 0px #000' }}
                type="submit" disabled={loading}
              >
                {loading ? 'Creating...' : 'Register Teacher'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AssignTeacher;
