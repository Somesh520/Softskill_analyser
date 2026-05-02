import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar, { SidebarProvider } from './Sidebar';

/**
 * DashboardLayout — wraps all authenticated portal pages with the sidebar.
 * Usage: <DashboardLayout role="admin" />
 * Renders <Outlet /> for nested routes.
 */
const DashboardLayout = ({ role }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!token || !userString) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userString);
    if (user.role && user.role.toLowerCase() !== role) {
      navigate('/');
      return;
    }

    setUserData(user);
  }, [navigate, role]);

  if (!userData) return null;

  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex h-screen bg-[#F0F0F0] overflow-hidden">
        <Sidebar role={role} userName={userData.name || ''} />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ userData }} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
