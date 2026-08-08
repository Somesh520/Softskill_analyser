"use client";

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar, { SidebarProvider } from './Sidebar';
import TopHeader from './TopHeader';

export default function RoleLayoutWrapper({ children, role }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role?.toLowerCase() !== role.toLowerCase()) {
        router.push('/login');
      }
    }
  }, [user, loading, router, role]);

  if (loading || !user || user.role?.toLowerCase() !== role.toLowerCase()) {
    return (
      <div className="flex h-screen bg-background items-center justify-center font-bold uppercase text-xl text-foreground">
        Checking authorization...
      </div>
    );
  }

  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar role={role.toLowerCase()} userName={user.name || ''} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopHeader userName={user.name || ''} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
