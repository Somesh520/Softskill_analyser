"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, LayoutDashboard, Settings } from 'lucide-react';
import NeoBrutalismCard from '../../../components/ui/NeoBrutalismCard';
import { useAuth } from '../../../context/AuthContext';

const AdminDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 bg-card border border-border rounded-2xl shadow-sm p-10 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Hello, <span className="text-primary">{user.name || 'Admin'}</span>!
            </h2>
            <p className="text-lg font-medium text-foreground/70 max-w-2xl">
              Welcome back. Manage your platform, users, and soft-skill parameters from here.
            </p>
          </div>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -4 }} onClick={() => router.push('/admin/teachers')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="Manage Teachers" 
              icon={<Users className="w-6 h-6 text-primary" />} 
              className="hover:border-primary/50 transition-colors"
            >
              View all active teachers, review their departments, and manage their account status.
            </NeoBrutalismCard>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} onClick={() => router.push('/admin/students')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="Manage Students" 
              icon={<Users className="w-6 h-6 text-primary" />} 
              className="hover:border-primary/50 transition-colors"
            >
              View all enrolled students, check their semester, teacher assignment, and account status.
            </NeoBrutalismCard>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} onClick={() => router.push('/admin/settings')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="System Settings" 
              icon={<Settings className="w-6 h-6 text-primary" />} 
              className="hover:border-primary/50 transition-colors"
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
