import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';

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
    { id: 'assign-teacher', label: 'Assign Teacher', icon: UserPlus, href: '/admin/assign-teacher' },
    { id: 'manage-teachers', label: 'All Teachers', icon: Users, href: '/admin/teachers' },
    { id: 'manage-students', label: 'All Students', icon: GraduationCap, href: '/admin/students' },
    { id: 'college-report', label: 'College Report', icon: BarChart, href: '/admin/college-report' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
  ],
  teacher: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/teacher/dashboard' },
    { id: 'my-classes', label: 'My Classes', icon: FolderOpen, href: '/teacher/classes' },
    { id: 'assigned-students', label: 'My Students', icon: Users, href: '/teacher/assigned-students' },
    { id: 'create-activity', label: 'Create Activity', icon: ClipboardCheck, href: '/teacher/create-activity' },
    { id: 'upload-csv', label: 'Upload CSV', icon: Upload, href: '/teacher/upload-csv' },
    { id: 'reports', label: 'Reports', icon: BarChart, href: '/teacher/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/teacher/settings' },
  ],
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
    { id: 'my-reports', label: 'My Reports', icon: FileText, href: '/student/my-reports' },
    { id: 'semester-report', label: 'Semester Report', icon: BarChart, href: '/student/semester-report' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, href: '/student/courses' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/student/settings' },
  ],
};

// ─── Color configs per role ──────────────────────────────────
const roleColors = {
  admin: { accent: '#00FFFF', activeText: '#000', icon: ShieldCheck, label: 'Admin' },
  teacher: { accent: '#FF00FF', activeText: '#000', icon: BookOpen, label: 'Teacher' },
  student: { accent: '#00FF00', activeText: '#000', icon: GraduationCap, label: 'Student' },
};

// ─── Sidebar Item ────────────────────────────────────────────
const SidebarItem = ({ item, isActive, isCollapsed, accentColor, onClick }) => {
  const Icon = item.icon;

  const content = (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 border-4 border-black font-black uppercase text-sm tracking-wide transition-all cursor-pointer ${
        isActive
          ? 'bg-black text-white translate-x-1 -translate-y-1'
          : 'bg-white text-black hover:-translate-y-1 hover:translate-x-1'
      }`}
      style={{
        boxShadow: isActive ? '0px 0px 0px #000' : '4px 4px 0px #000',
      }}
      whileTap={{ scale: 0.97, x: 0, y: 0 }}
      title={isCollapsed ? item.label : undefined}
    >
      <div className="relative flex items-center justify-center min-w-[24px]">
        <Icon strokeWidth={3} size={20} style={{ color: isActive ? accentColor : '#000' }} />
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
    </motion.button>
  );

  return content;
};

// ─── Main Sidebar Component ──────────────────────────────────
const Sidebar = ({ role = 'student', userName = '' }) => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const items = menuConfigs[role] || menuConfigs.student;
  const colors = roleColors[role] || roleColors.student;
  const RoleIcon = colors.icon;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-screen bg-white border-r-8 border-black flex flex-col shrink-0 overflow-hidden"
      style={{ boxShadow: '8px 0px 0px #000' }}
    >
      {/* ─── Header ──────────────────────── */}
      <div 
        className="flex items-center justify-between p-4 border-b-4 border-black"
        style={{ backgroundColor: colors.accent }}
      >
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-10 h-10 bg-black flex items-center justify-center border-4 border-black"
                style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.3)' }}
              >
                <RoleIcon strokeWidth={3} size={20} style={{ color: colors.accent }} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tight text-black">CRPC</span>
                <span
                  className="text-xs font-black uppercase px-1 border-2 border-black inline-block bg-white text-black"
                >
                  {colors.label} Portal
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-8 h-8 bg-white border-4 border-black flex items-center justify-center font-black hover:-translate-y-1 transition-transform cursor-pointer ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          style={{ boxShadow: '3px 3px 0px #000' }}
        >
          {isCollapsed ? <ChevronRight strokeWidth={4} size={16} /> : <ChevronLeft strokeWidth={4} size={16} />}
        </button>
      </div>

      {/* ─── User Info ───────────────────── */}
      <AnimatePresence>
        {!isCollapsed && userName && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 border-b-4 border-black bg-[#f8f8f8]"
          >
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Logged in as</p>
            <p className="text-sm font-black uppercase text-black truncate">{userName}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Navigation Items ────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2">
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={location.pathname === item.href}
            isCollapsed={isCollapsed}
            accentColor={colors.accent}
            onClick={() => navigate(item.href)}
          />
        ))}
      </nav>

      {/* ─── Logout Button ───────────────── */}
      <div className="p-3 border-t-4 border-black">
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 bg-[#FF0000] text-white border-4 border-black font-black uppercase text-sm tracking-wide cursor-pointer hover:-translate-y-1 hover:translate-x-1 transition-all"
          style={{ boxShadow: '4px 4px 0px #000' }}
          whileTap={{ scale: 0.97 }}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut strokeWidth={3} size={20} />
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
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
