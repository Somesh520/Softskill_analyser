"use client";

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Palette, Sun, Moon, Leaf, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeCustomizer = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    { id: 'light', icon: Sun, label: 'Light', color: '#f8fafc', textClass: 'text-yellow-500' },
    { id: 'dark', icon: Moon, label: 'Dark', color: '#000000', textClass: 'text-slate-200' },
    { id: 'theme-forest', icon: Leaf, label: 'Forest', color: '#064e3b', textClass: 'text-green-500' },
    { id: 'theme-rose', icon: Heart, label: 'Rose', color: '#831843', textClass: 'text-rose-500' }
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-foreground p-3 rounded-l-xl shadow-lg hover:pr-4 transition-all duration-300 ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
        title="Customize Theme"
      >
        <Palette size={24} />
      </button>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-72 bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <Palette size={20} className="text-primary" /> Theme Customizer
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <p className="text-sm text-foreground/60 mb-4">Choose your preferred aesthetic:</p>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((t) => {
                    const isActive = theme === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          isActive 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-inner"
                          style={{ backgroundColor: t.color }}
                        >
                          <Icon size={20} className={t.textClass} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground/80'}`}>
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeCustomizer;
