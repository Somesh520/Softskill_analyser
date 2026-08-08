"use client";
import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../api/authApi';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  FileText,
  BarChart,
  ClipboardCheck,
  UserPlus,
  ShieldCheck,
  Upload,
  FolderOpen,
  Terminal,
  Trophy } from 'lucide-react';

// ─── Sidebar Context ─────────────────────────────────────────
const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children, defaultCollapsed = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

// ─── Role-specific menu configs ──────────────────────────────
const menuConfigs = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, href: '/admin/leaderboard' },
    { id: 'surveys', label: 'Surveys', icon: FileText, href: '/admin/surveys' },
    { id: 'assign-teacher', label: 'Assign Teacher', icon: UserPlus, href: '/admin/assign-teacher' },
    { id: 'manage-teachers', label: 'All Teachers', icon: Users, href: '/admin/teachers' },
    { id: 'manage-students', label: 'All Students', icon: GraduationCap, href: '/admin/students' },
    { id: 'activity-logs', label: 'Activity Logs', icon: Terminal, href: '/admin/logs' },
    { id: 'college-report', label: 'College Report', icon: BarChart, href: '/admin/college-report' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
  ],
  teacher: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/teacher/dashboard' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, href: '/teacher/leaderboard' },
    { id: 'surveys', label: 'Surveys', icon: FileText, href: '/teacher/surveys' },
    { id: 'my-classes', label: 'My Classes', icon: FolderOpen, href: '/teacher/classes' },
    { id: 'assigned-students', label: 'My Students', icon: Users, href: '/teacher/assigned-students' },
    { id: 'create-activity', label: 'Create Activity', icon: ClipboardCheck, href: '/teacher/create-activity' },
    { id: 'upload-marks', label: 'Upload Marks', icon: Upload, href: '/teacher/upload-marks' },
    { id: 'reports', label: 'Reports', icon: BarChart, href: '/teacher/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/teacher/settings' },
  ],
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
    { id: 'surveys', label: 'Pending Surveys', icon: FileText, href: '/student/surveys' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, href: '/student/leaderboard' },
    { id: 'my-reports', label: 'My Reports', icon: FileText, href: '/student/my-reports' },
    { id: 'semester-report', label: 'Semester Report', icon: BarChart, href: '/student/semester-report' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/student/settings' },
  ] };

const roleColors = {
  admin: { icon: ShieldCheck, label: 'Admin' },
  teacher: { icon: BookOpen, label: 'Teacher' },
  student: { icon: GraduationCap, label: 'Student' } };

// ─── Sidebar Item ────────────────────────────────────────────
const SidebarItem = ({ item, isActive, isCollapsed }) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
      }`}
      title={isCollapsed ? item.label : undefined}
    >
      <div className="relative flex items-center justify-center min-w-[24px]">
        <Icon size={18} className={isActive ? 'text-primary' : ''} />
      </div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};

// ─── Main Sidebar Component ──────────────────────────────────
const Sidebar = ({ role = 'student' }) => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuth();

  const userName = user?.name || 'Unknown User';
  const userEmail = user?.email || (userName.toLowerCase().replace(' ', '.') + '@kiet.edu');

  const items = menuConfigs[role] || menuConfigs.student;
  const config = roleColors[role] || roleColors.student;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };



  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-screen bg-sidebar text-sidebar-foreground flex flex-col shrink-0 overflow-hidden shadow-xl z-20 transition-colors duration-300 border-r border-border"
    >
      {/* ─── Header ──────────────────────── */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-sidebar-foreground/10 shrink-0">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shrink-0 shadow-sm">
                <config.icon size={18} className="text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-wider uppercase text-primary">{config.label} PORTAL</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-8 h-8 flex items-center justify-center rounded-md hover:bg-sidebar-foreground/10 text-sidebar-foreground/70 transition-colors ${
            isCollapsed ? 'mx-auto' : ''
          }`}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ─── User Profile Area ───────────── */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-6 flex flex-col items-center border-b border-sidebar-foreground/10"
          >
            <div className="w-16 h-16 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center text-2xl font-bold mb-3">
              {userName.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-bold text-center w-full truncate">{userName.toUpperCase()}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate mt-1">{userEmail}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 py-2 mt-2">
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-2 px-2">
          {isCollapsed ? '' : config.label.toUpperCase()}
        </p>
      </div>

      {/* ─── Navigation Items ────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-1 scrollbar-thin scrollbar-thumb-sidebar-foreground/20">
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* ─── Logout Button ───────────────── */}
      <div className="p-3 border-t border-sidebar-foreground/10 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <div className="relative flex items-center justify-center min-w-[24px]">
            <LogOut size={18} />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
