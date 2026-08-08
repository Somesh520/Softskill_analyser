"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, ArrowLeft, Save, User, Mail, Shield, Bell, Moon, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const router = useRouter();
  const { user: userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-primary/10 border border-border rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="bg-primary/20 p-4 border border-primary/30 rounded-xl text-primary">
                <SettingsIcon size={40} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-foreground">Account Settings</h2>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">Manage Your Preferences & Profile</p>
              </div>
            </div>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl shadow-sm p-8"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground/90">
                <User className="text-primary" size={24} /> Profile Information
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-border rounded-xl bg-background/50">
                  <span className="text-sm font-semibold text-foreground/60 mb-1 sm:mb-0 flex items-center gap-2"><User size={16}/> Name</span>
                  <span className="font-bold text-foreground">{userData.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-border rounded-xl bg-background/50">
                  <span className="text-sm font-semibold text-foreground/60 mb-1 sm:mb-0 flex items-center gap-2"><Mail size={16}/> Email</span>
                  <span className="font-bold text-foreground">{userData.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-border rounded-xl bg-background/50">
                  <span className="text-sm font-semibold text-foreground/60 mb-1 sm:mb-0 flex items-center gap-2"><Shield size={16}/> Role</span>
                  <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 font-bold uppercase text-xs rounded-full">
                    {userData.role}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Preferences Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl shadow-sm p-8"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground/90">
                <SettingsIcon className="text-primary" size={24} /> Preferences
              </h3>
              <div className="space-y-4">
                <label className="flex justify-between items-center p-4 border border-border rounded-xl hover:bg-primary/5 transition-colors cursor-pointer group">
                  <span className="font-semibold text-foreground/80 group-hover:text-foreground flex items-center gap-3"><Bell size={18} className="text-foreground/50"/> Email Notifications</span>
                  <input type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50" defaultChecked />
                </label>
                <label className="flex justify-between items-center p-4 border border-border rounded-xl hover:bg-primary/5 transition-colors cursor-pointer group">
                  <span className="font-semibold text-foreground/80 group-hover:text-foreground flex items-center gap-3"><Clock size={18} className="text-foreground/50"/> Activity Reminders</span>
                  <input type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50" defaultChecked />
                </label>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <button
                onClick={() => router.back()}
                className="flex-1 bg-card border border-border p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-foreground/5 transition-colors text-foreground/80 shadow-sm"
              >
                <ArrowLeft size={20} /> Go Back
              </button>
              <button
                className="flex-1 bg-primary text-primary-foreground border border-primary/50 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-md transition-all hover:-translate-y-0.5"
              >
                <Save size={20} /> Save Changes
              </button>
            </motion.div>

          </div>

      </main>
    </div>
  );
};

export default SettingsPage;
