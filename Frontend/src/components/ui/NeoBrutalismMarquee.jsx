import React from 'react';
import { motion } from 'framer-motion';

const NeoBrutalismMarquee = ({ items, speed = 40 }) => {
  return (
    <div className="w-full bg-primary text-primary-foreground overflow-hidden py-4 border-y border-border">
      <motion.div
        className="flex whitespace-nowrap gap-12"
        animate={{ x: [0, -1000] }}
        transition={{
          x: { repeat: Infinity, repeatType: 'loop', duration: speed, ease: 'linear' },
        }}
      >
        {[...items, ...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center gap-4 text-lg font-semibold tracking-wide">
            <span>{item}</span>
            <span className="opacity-50">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default NeoBrutalismMarquee;
