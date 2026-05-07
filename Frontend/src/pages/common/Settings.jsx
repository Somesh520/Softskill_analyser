import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import Sidebar, { SidebarProvider } from '../../components/layout/Sidebar';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userString) navigate('/login');
    const user = JSON.parse(userString);
    setUserData(user);
    setLoading(false);
  }, [navigate]);

  if (!userData) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-gradient-to-r from-[#FFEB3B] to-[#FF00FF] border-8 border-black p-8 relative overflow-hidden"
            style={{ boxShadow: '16px 16px 0px rgba(0,0,0,0.4)' }}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#00FFFF] opacity-20 border-4 border-black rotate-45"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="bg-white p-4 border-4 border-black text-black transform -rotate-3" style={{ boxShadow: '6px 6px 0px #000' }}>
                <SettingsIcon size={48} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 leading-tight tracking-tighter text-black drop-shadow-lg">SETTINGS</h2>
                <p className="text-sm font-black text-black uppercase tracking-widest bg-white inline-block px-3 py-1 border-2 border-black">Manage Your Preferences & Profile</p>
              </div>
            </div>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                👤 PROFILE INFORMATION
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border-4 border-black">
                  <span className="font-bold text-gray-700">Name:</span>
                  <span className="font-black text-lg">{userData.name}</span>
                </div>
                <div className="flex justify-between items-center p-4 border-4 border-black bg-[#F8F9FA]">
                  <span className="font-bold text-gray-700">Email:</span>
                  <span className="font-black text-lg">{userData.email}</span>
                </div>
                <div className="flex justify-between items-center p-4 border-4 border-black">
                  <span className="font-bold text-gray-700">Role:</span>
                  <span className="bg-[#FF00FF] text-white px-3 py-1 font-black uppercase text-sm">{userData.role}</span>
                </div>
              </div>
            </motion.div>

            {/* Preferences Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                ⚙️ PREFERENCES
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border-4 border-black hover:bg-[#FFFACD] transition-all">
                  <span className="font-bold">Email Notifications</span>
                  <input type="checkbox" className="w-6 h-6 border-2 border-black" defaultChecked />
                </div>
                <div className="flex justify-between items-center p-4 border-4 border-black bg-[#F8F9FA] hover:bg-[#FFFACD] transition-all">
                  <span className="font-bold">Dark Mode</span>
                  <input type="checkbox" className="w-6 h-6 border-2 border-black" />
                </div>
                <div className="flex justify-between items-center p-4 border-4 border-black hover:bg-[#FFFACD] transition-all">
                  <span className="font-bold">Activity Reminders</span>
                  <input type="checkbox" className="w-6 h-6 border-2 border-black" defaultChecked />
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-white border-6 border-black p-4 font-black uppercase text-lg flex items-center justify-center gap-3 hover:bg-[#FFEB3B] active:scale-95 transition-all"
                style={{ boxShadow: '6px 6px 0px #000' }}
              >
                <ArrowLeft size={24} /> BACK
              </button>
              <button
                className="flex-1 bg-[#00FF00] border-6 border-black p-4 font-black uppercase text-lg hover:shadow-lg active:scale-95 transition-all"
                style={{ boxShadow: '6px 6px 0px #000' }}
              >
                💾 SAVE CHANGES
              </button>
            </div>

          </div>

        </main>
    </div>
  );
};

export default SettingsPage;
