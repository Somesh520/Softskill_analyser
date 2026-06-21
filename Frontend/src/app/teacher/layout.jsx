"use client";
import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar, { SidebarProvider } from '../../components/layout/Sidebar';

export default function TeacherLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role?.toLowerCase() !== 'teacher') {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role?.toLowerCase() !== 'teacher') {
    return (
      <div className="flex h-screen bg-[#F0F0F0] items-center justify-center font-black uppercase text-xl text-black">
        Checking authorization...
      </div>
    );
  }

  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex h-screen bg-[#F0F0F0] overflow-hidden">
        <Sidebar role="teacher" userName={user.name || ''} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
