import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import NeoBrutalismButton from './NeoBrutalismButton';

const NeoBrutalismHero = ({
  title,
  subtitle,
  description,
  primaryBtnText = "Get Started",
  secondaryBtnText = "View Demo",
  onPrimaryClick,
  onSecondaryClick,
}) => {
  return (
    <section className="relative min-h-screen w-full bg-[#FFEB3B] overflow-hidden flex items-center justify-center pt-20">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 20px),
                           repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 20px)`,
        }}
      />

      {/* Floating Shapes */}
      <motion.div
        className="absolute top-20 right-20 w-32 h-32 bg-[#00FFFF] border-4 border-black hidden md:block"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ boxShadow: '8px 8px 0px #000' }}
      />
      
      <motion.div
        className="absolute bottom-40 left-20 w-24 h-24 bg-[#FF00FF] border-4 border-black rounded-full hidden md:block"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ boxShadow: '8px 8px 0px #000' }}
      />

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-black text-[#FFEB3B] px-6 py-3 border-4 border-black mb-8"
          style={{ boxShadow: '6px 6px 0px #000' }}
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-black text-sm uppercase tracking-wider">Soft Skill Analyzer</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none tracking-tight"
          style={{
            textShadow: '8px 8px 0px #000',
            WebkitTextStroke: '3px #000',
            color: '#FFEB3B',
          }}
        >
          {title}
        </motion.h1>

        {/* Subtitle & Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mb-12 bg-white border-4 border-black p-8 text-left"
          style={{ boxShadow: '10px 10px 0px #000' }}
        >
          <h2 className="text-3xl md:text-4xl font-black uppercase mb-4 text-black">
            {subtitle}
          </h2>
          <p className="text-xl font-bold text-black leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-8"
        >
          <NeoBrutalismButton variant="secondary" onClick={onPrimaryClick}>
            {primaryBtnText}
          </NeoBrutalismButton>

          <NeoBrutalismButton variant="white" onClick={onSecondaryClick}>
            {secondaryBtnText}
          </NeoBrutalismButton>
        </motion.div>
      </div>
    </section>
  );
};

export default NeoBrutalismHero;
