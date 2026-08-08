"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { 
  Star, 
  Sun, 
  Moon,
  Menu,
  Leaf,
  Heart,
  Settings,
  LogOut
} from 'lucide-react';
import { useSidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { logout } from '../../api/authApi';

const TopHeader = () => {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const userName = user?.name || 'User';
  const batchInfo = user?.batch ? `${user.batch} (${user?.semester || 'Odd'})` : (user?.role === 'student' ? '2026-2027' : 'Staff');

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const { isCollapsed, setIsCollapsed } = useSidebar();

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className="h-16 bg-white dark:bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle (if needed) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="lg:hidden text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md"
        >
          <Menu size={20} />
        </button>
        <Star className="text-yellow-500 fill-yellow-500" size={20} />
      </div>

      <div className="flex items-center gap-4">

        
        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="hidden md:flex flex-col items-end justify-center">
              <span className="text-base font-extrabold tracking-wide leading-tight">{userName}</span>
            </div>
            <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold text-sm ring-1 ring-primary/20">
              {getInitials(userName)}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-3 border-b border-border mb-2">
                <p className="text-sm font-bold truncate">{userName}</p>
                <p className="text-xs text-foreground/50 truncate">{user?.email || batchInfo}</p>
              </div>

              <div className="flex flex-col py-1">
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push(`/${user?.role || 'student'}/settings`);
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground transition-colors w-full text-left"
                >
                  <Settings size={16} />
                  Change Password
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full text-left mt-1"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
