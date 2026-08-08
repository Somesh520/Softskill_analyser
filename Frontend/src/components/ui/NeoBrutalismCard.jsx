import React from 'react';
import { motion } from 'framer-motion';

const NeoBrutalismCard = ({ 
  children, 
  title, 
  icon, 
  color = '#3b82f6', 
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm transition-all flex flex-col h-full ${className}`}
    >
      {icon && (
        <div
          className="w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-white"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
      )}

      {title && (
        <h3 className="text-lg font-bold mb-3">
          {title}
        </h3>
      )}

      <div className="text-sm leading-relaxed flex-grow text-foreground/80">
        {children}
      </div>
    </motion.div>
  );
};

export default NeoBrutalismCard;
