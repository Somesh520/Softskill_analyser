import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Building, Calendar, ArrowLeft, RefreshCw, UserPlus, Search } from 'lucide-react';
import { getTeachers } from '../../api/adminApi';

const ManageTeachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.deptName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F0F0] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 font-black uppercase bg-white border-4 border-black px-4 py-2 mb-4 hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all"
              style={{ boxShadow: '4px 4px 0px #000' }}
            >
              <ArrowLeft strokeWidth={3} size={20} /> Dashboard
            </button>
            <h1 className="text-5xl font-black uppercase leading-none tracking-tighter">
              Manage <br /> <span className="text-[#FF00FF]">Teachers</span>
            </h1>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={fetchTeachers}
              disabled={loading}
              className="bg-[#00FFFF] border-4 border-black p-4 hover:rotate-3 transition-all disabled:opacity-50"
              style={{ boxShadow: '6px 6px 0px #000' }}
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} strokeWidth={3} />
            </button>
            <button 
              onClick={() => navigate('/admin/assign-teacher')}
              className="bg-[#00FF00] border-4 border-black px-6 py-4 font-black uppercase text-xl flex items-center gap-2 hover:-translate-y-1 transition-all"
              style={{ boxShadow: '8px 8px 0px #000' }}
            >
              <UserPlus strokeWidth={3} /> Add New Teacher
            </button>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="absolute left-6 top-1/2 -translate-y-1/2">
            <Search strokeWidth={4} size={24} />
          </div>
          <input 
            type="text"
            placeholder="SEARCH BY NAME, EMAIL OR DEPARTMENT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-8 border-black p-6 pl-16 text-2xl font-black uppercase placeholder:text-gray-400 focus:outline-none focus:bg-[#FFFF00] transition-colors"
            style={{ boxShadow: '12px 12px 0px #000' }}
          />
        </motion.div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 border-8 border-black border-t-[#FF00FF] animate-spin mb-4" />
            <p className="text-2xl font-black uppercase">Loading Teachers...</p>
          </div>
        ) : error ? (
          <div className="bg-[#FF0000] border-8 border-black p-12 text-center" style={{ boxShadow: '16px 16px 0px #000' }}>
            <h2 className="text-4xl font-black uppercase text-white mb-4">Error Detected!</h2>
            <p className="text-xl font-bold uppercase mb-8">{error}</p>
            <button 
              onClick={fetchTeachers}
              className="bg-white border-4 border-black px-8 py-3 font-black uppercase hover:bg-black hover:text-white transition-all"
            >
              Try Again
            </button>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white border-8 border-black p-12 text-center" style={{ boxShadow: '16px 16px 0px #000' }}>
            <h2 className="text-4xl font-black uppercase mb-4">No Teachers Found</h2>
            <p className="text-xl font-bold uppercase text-gray-500">Try adjusting your search or add a new teacher.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher, index) => (
              <motion.div
                key={teacher._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border-8 border-black p-6 hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all group relative overflow-hidden"
                style={{ boxShadow: '12px 12px 0px #000' }}
              >
                <div className="absolute top-[-20px] right-[-20px] w-16 h-16 bg-[#FFFF00] border-4 border-black rotate-45 group-hover:bg-[#FF00FF] transition-colors" />
                
                <h3 className="text-2xl font-black uppercase mb-4 line-clamp-1">{teacher.name}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-[#F0F0F0] border-4 border-black p-3 font-bold text-sm">
                    <Mail size={18} strokeWidth={3} className="text-[#FF00FF]" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-[#F0F0F0] border-4 border-black p-3 font-bold text-sm">
                    <Building size={18} strokeWidth={3} className="text-[#00FFFF]" />
                    <span>{teacher.deptName}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-[#F0F0F0] border-4 border-black p-3 font-bold text-sm">
                    <Calendar size={18} strokeWidth={3} className="text-[#00FF00]" />
                    <span>Joined {new Date(teacher.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t-4 border-black border-dashed flex gap-3">
                  <button className="flex-1 bg-black text-white font-black uppercase py-2 border-4 border-black hover:bg-white hover:text-black transition-all text-xs">
                    View Stats
                  </button>
                  <button className="flex-1 bg-[#FF0000] text-black font-black uppercase py-2 border-4 border-black hover:bg-white transition-all text-xs">
                    Remove
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
