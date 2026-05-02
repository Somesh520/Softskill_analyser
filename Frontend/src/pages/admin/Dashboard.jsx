import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, LayoutDashboard } from 'lucide-react';
import NeoBrutalismCard from '../../components/ui/NeoBrutalismCard';
import Sidebar, { SidebarProvider } from '../../components/layout/Sidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!token || !userString) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userString);
    if (user.role && user.role.toLowerCase() !== 'admin') {
      navigate('/');
      return;
    }

    setAdminData(user);
  }, [navigate]);

  if (!adminData) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-[#F0F0F0] overflow-hidden">
        <Sidebar role="admin" userName={adminData.name || ''} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {/* Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-[#00FFFF] border-8 border-black p-8"
            style={{ boxShadow: '12px 12px 0px #000' }}
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">Hello, {adminData.name || 'Admin'}!</h2>
            <p className="text-xl font-bold">Welcome back. Manage your platform, users, and soft-skill parameters from here.</p>
          </motion.div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }} onClick={() => navigate('/admin/assign-teacher')} className="cursor-pointer">
              <NeoBrutalismCard 
                title="Manage Teachers" 
                icon={<Users className="w-8 h-8" />} 
                color="#FF00FF"
              >
                Add new teachers, review their assigned students, and remove inactive accounts.
              </NeoBrutalismCard>
            </motion.div>

            <motion.div whileHover={{ y: -5 }}>
              <NeoBrutalismCard 
                title="Manage Students" 
                icon={<Users className="w-8 h-8" />} 
                color="#00FF00"
              >
                Onboard thousands of students and assign them to specific semantic batches and teachers.
              </NeoBrutalismCard>
            </motion.div>

            <motion.div whileHover={{ y: -5 }}>
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
    </SidebarProvider>
  );
};

export default Dashboard;
