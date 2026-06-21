"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, LayoutDashboard } from 'lucide-react';
import NeoBrutalismCard from '../../../components/ui/NeoBrutalismCard';
import { useAuth } from '../../../context/AuthContext';

const AdminDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 bg-[#00FFFF] border-8 border-black p-8"
          style={{ boxShadow: '12px 12px 0px #000' }}
        >
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 text-black">Hello, {user.name || 'Admin'}!</h2>
          <p className="text-xl font-bold text-black">Welcome back. Manage your platform, users, and soft-skill parameters from here.</p>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div whileHover={{ y: -5 }} onClick={() => router.push('/admin/teachers')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="Manage Teachers" 
              icon={<Users className="w-8 h-8" />} 
              color="#FF00FF"
            >
              View all active teachers, review their departments, and manage their account status.
            </NeoBrutalismCard>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} onClick={() => router.push('/admin/students')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="Manage Students" 
              icon={<Users className="w-8 h-8" />} 
              color="#00FF00"
            >
              View all enrolled students, check their semester, teacher assignment, and account status.
            </NeoBrutalismCard>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} onClick={() => router.push('/admin/settings')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="System Settings" 
              icon={<LayoutDashboard className="w-8 h-8" />} 
              color="#FFEB3B"
            >
              Configure evaluation criteria, manage semesters, and view aggregate scoring analytics.
            </NeoBrutalismCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
