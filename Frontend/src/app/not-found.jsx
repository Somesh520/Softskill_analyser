"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <main role="main" className="min-h-screen bg-[#F0F0F0] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative background elements in Neo-Brutalism */}
      <motion.div 
        className="absolute top-10 left-10 w-24 h-24 bg-[#FFEB3B] border-4 border-black rounded-full hidden md:block" 
        style={{ boxShadow: '6px 6px 0px #000' }}
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-10 right-10 w-28 h-28 bg-[#00FFFF] border-4 border-black hidden md:block" 
        style={{ boxShadow: '-6px -6px 0px #000' }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Main Card */}
        <div 
          className="bg-white border-8 border-black p-10 flex flex-col items-center"
          style={{ boxShadow: '12px 12px 0px #000' }}
        >
          {/* Warn Badge */}
          <div 
            className="bg-[#FF00FF] text-white font-black uppercase text-sm border-4 border-black px-4 py-2 mb-6 flex items-center gap-2"
            style={{ boxShadow: '4px 4px 0px #000' }}
          >
            <AlertTriangle className="w-5 h-5" /> Error 404
          </div>

          {/* Huge Animated 404 */}
          <motion.h1 
            className="text-8xl md:text-9xl font-black uppercase mb-4 leading-none"
            style={{
              textShadow: '6px 6px 0px #00FFFF',
              WebkitTextStroke: '2px black',
              color: '#FFEB3B'
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            404
          </motion.h1>

          <h2 className="text-2xl md:text-3xl font-black uppercase mb-4 text-black">
            Page Not Found
          </h2>

          <p className="text-base font-bold text-gray-700 mb-8 leading-relaxed">
            The page you are looking for does not exist, has been removed, or is temporarily unavailable. Double check the URL or head back home.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link 
              href="/"
              className="flex-1 bg-[#00FF00] hover:bg-[#00E500] text-black font-black uppercase py-4 border-4 border-black flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 active:translate-y-0"
              style={{ boxShadow: '4px 4px 0px #000' }}
            >
              <Home className="w-5 h-5" /> Back Home
            </Link>

            <button 
              onClick={() => window.history.back()}
              className="flex-1 bg-white hover:bg-gray-100 text-black font-black uppercase py-4 border-4 border-black flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 active:translate-y-0"
              style={{ boxShadow: '4px 4px 0px #000' }}
            >
              <ArrowLeft className="w-5 h-5" /> Go Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
