"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, FileText, ClipboardCheck, FolderOpen } from 'lucide-react';
import NeoBrutalismCard from '../../../components/ui/NeoBrutalismCard';
import { useAuth } from '../../../context/AuthContext';

const TeacherDashboard = () => {
  const router = useRouter();
  const { user: teacherData } = useAuth();

  if (!teacherData) return null;

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
              Hello, <span className="text-primary">{teacherData.name || 'Teacher'}</span>!
            </h2>
            <p className="text-lg font-medium text-foreground/70 max-w-2xl">
              Welcome back. Manage your students, evaluate activities, and track progress.
            </p>
          </div>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -4 }} onClick={() => router.push('/teacher/classes')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="My Classes" 
              icon={<FolderOpen className="w-6 h-6 text-primary" />} 
              className="hover:border-primary/50 transition-colors"
            >
              Manage all your assigned classes and their details.
            </NeoBrutalismCard>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} onClick={() => router.push('/teacher/assigned-students')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="My Students" 
              icon={<Users className="w-6 h-6 text-primary" />} 
              className="hover:border-primary/50 transition-colors"
            >
              View your batch of assigned students, track their profiles, and manage their details.
            </NeoBrutalismCard>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} onClick={() => router.push('/teacher/create-activity')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="Create Activity" 
              icon={<ClipboardCheck className="w-6 h-6 text-primary" />} 
              className="hover:border-primary/50 transition-colors"
            >
              Set up new soft-skill assessments, assign rubrics, and schedule evaluations.
            </NeoBrutalismCard>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} onClick={() => router.push('/teacher/reports')} className="cursor-pointer">
            <NeoBrutalismCard 
              title="Generate Reports" 
              icon={<FileText className="w-6 h-6 text-primary" />} 
              className="hover:border-primary/50 transition-colors"
            >
              Compile semester-end scores, generate detailed performance reports, and analyze data.
            </NeoBrutalismCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
