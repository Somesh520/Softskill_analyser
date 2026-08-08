"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <main role="main" className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative background elements in Neo-Brutalism */}
      <motion.div 
        className="absolute top-10 left-10 w-24 h-24 bg-yellow-100 text-yellow-800 border border-border rounded-lg shadow-sm rounded-full hidden md:block" 
        
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-10 right-10 w-28 h-28 bg-cyan-100 text-cyan-800 border border-border rounded-lg shadow-sm hidden md:block" 
        
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Main Card */}
        <div 
          className="bg-white border border-border rounded-xl shadow-md p-10 flex flex-col items-center"
          
        >
          {/* Warn Badge */}
          <div 
            className="bg-purple-100 text-purple-800 text-white font-bold uppercase text-sm border border-border rounded-lg shadow-sm px-4 py-2 mb-6 flex items-center gap-2"
            
          >
            <AlertTriangle className="w-5 h-5" /> Error 404
          </div>

          {/* Huge Animated 404 */}
          <motion.h1 
            className="text-8xl md:text-9xl font-bold uppercase mb-4 leading-none"
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

          <h2 className="text-2xl md:text-3xl font-bold uppercase mb-4 text-black">
            Page Not Found
          </h2>

          <p className="text-base font-bold text-gray-700 mb-8 leading-relaxed">
            The page you are looking for does not exist, has been removed, or is temporarily unavailable. Double check the URL or head back home.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link 
              href="/"
              className="flex-1 bg-green-100 text-green-800 hover:bg-[#00E500] text-black font-bold uppercase py-4 border border-border rounded-lg shadow-sm flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 active:translate-y-0"
              
            >
              <Home className="w-5 h-5" /> Back Home
            </Link>

            <button 
              onClick={() => window.history.back()}
              className="flex-1 bg-white hover:bg-gray-100 text-black font-bold uppercase py-4 border border-border rounded-lg shadow-sm flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 active:translate-y-0"
              
            >
              <ArrowLeft className="w-5 h-5" /> Go Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
