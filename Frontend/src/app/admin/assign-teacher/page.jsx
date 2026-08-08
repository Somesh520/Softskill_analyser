"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Building } from 'lucide-react';
import { createTeacher } from '../../../api/adminApi';
import { useAuth } from '../../../context/AuthContext';

const DEPARTMENTS = [
  "B.Pharma", "mechatronics", "CSE", "CSE AI", "CSE-AIML", "CS",
  "CSE-CYBER SECURITY", "CSE- DATA SCIENCE", "IT", "CSIT", "ECE",
  "ECE- VLSI", "EEE", "ELCE", "ME",
  "AMIA (Advanced Mechatronics and Industrial Automation)", "MBA", "MCA"
];
const AssignTeacher = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    deptName: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCheckboxChange = (dept) => {
    setFormData(prev => {
      const isSelected = prev.deptName.includes(dept);
      if (isSelected) {
        return { ...prev, deptName: prev.deptName.filter(d => d !== dept) };
      } else {
        return { ...prev, deptName: [...prev.deptName, dept] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await createTeacher(formData);
      setMessage(response.message || 'Teacher assigned successfully!');
      setFormData({ name: '', email: '', password: '', deptName: [] });
    } catch (err) {
      setError(err.message || 'Failed to assign teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl shadow-sm p-8 md:p-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-primary/10 p-3 border border-primary/20 rounded-xl text-primary">
                <UserPlus size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Assign Teacher</h1>
            </div>
            <p className="text-sm font-semibold mb-8 text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">
              Create a new teacher account
            </p>

            {message && (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-500/10 text-green-500 font-semibold p-4 border border-green-500/20 rounded-xl mb-6 text-sm flex items-center gap-2">
                🎉 {message}
              </motion.div>
            )}

            {error && (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-red-500/10 text-red-500 font-semibold p-4 border border-red-500/20 rounded-xl mb-6 text-sm flex items-center gap-2">
                ⚠️ {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-2">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors z-10"><UserPlus size={18} /></div>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl shadow-sm pl-11 pr-4 py-3 font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-foreground/30"
                       placeholder="John Doe" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-2">Department</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors z-10"><Building size={18} /></div>
                    <div 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`w-full bg-background border ${dropdownOpen ? 'border-primary/50 ring-2 ring-primary/50' : 'border-border'} rounded-xl shadow-sm pl-11 pr-4 py-3 font-medium cursor-pointer text-foreground flex justify-between items-center transition-all`}
                    >
                      <span className="truncate text-foreground/80">
                        {formData.deptName.length > 0 
                          ? formData.deptName.join(', ') 
                          : 'Select Department(s)'}
                      </span>
                      <span className="text-foreground/40">{dropdownOpen ? '▲' : '▼'}</span>
                    </div>

                    {dropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                        {DEPARTMENTS.map(dept => (
                          <label key={dept} className="flex items-center gap-3 p-3 hover:bg-primary/5 cursor-pointer border-b border-border/50 last:border-b-0 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={formData.deptName.includes(dept)}
                              onChange={() => handleCheckboxChange(dept)}
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50"
                            />
                            <span className="font-medium text-foreground text-sm">{dept}</span>
                          </label>
                        ))}
                      </div>
                    )}                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-2">Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors z-10"><Mail size={18} /></div>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl shadow-sm pl-11 pr-4 py-3 font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-foreground/30"
                       placeholder="teacher@kiet.edu" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-2">Temporary Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors z-10"><Lock size={18} /></div>
                    <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl shadow-sm pl-11 pr-4 py-3 font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-foreground/30"
                       placeholder="securePassword123" required />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={!loading ? { y: -2 } : {}}
                whileTap={!loading ? { y: 0 } : {}}
                className={`w-full bg-primary text-primary-foreground font-bold text-lg rounded-xl shadow-md py-4 mt-8 flex justify-center items-center gap-2 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
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
