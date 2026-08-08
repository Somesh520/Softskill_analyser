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
  onSecondaryClick 
}) => {
  return (
    <section className="relative min-h-screen w-full bg-background overflow-hidden flex items-center justify-center pt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full mb-8 text-xs font-semibold uppercase tracking-wider"
        >
          <Sparkles className="w-4 h-4" />
          <span>Soft Skill Analyser – KIET</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-foreground"
        >
          {title}
        </motion.h1>

        {/* Subtitle & Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mb-12 flex flex-col items-center text-center"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground/90">
            {subtitle}
          </h2>
          <p className="text-lg text-foreground/70 leading-relaxed max-w-2xl">
            {description}
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <NeoBrutalismButton variant="primary" onClick={onPrimaryClick}>
            {primaryBtnText}
          </NeoBrutalismButton>

          <NeoBrutalismButton variant="secondary" onClick={onSecondaryClick}>
            {secondaryBtnText}
          </NeoBrutalismButton>
        </motion.div>
      </div>
    </section>
  );
};

export default NeoBrutalismHero;
