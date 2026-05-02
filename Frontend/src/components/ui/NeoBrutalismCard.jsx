import React from 'react';
import { motion } from 'framer-motion';

const NeoBrutalismCard = ({ 
  children, 
  title, 
  icon, 
  color = '#FFFFFF', 
  className = '',
  shadowColor = '#000'
}) => {
  return (
    <motion.div
      whileHover={{ x: -4, y: -4, boxShadow: `12px 12px 0px ${shadowColor}` }}
      className={`bg-white border-4 border-black p-8 transition-all flex flex-col h-full ${className}`}
      style={{ boxShadow: `8px 8px 0px ${shadowColor}` }}
    >
      {icon && (
        <div
          className="w-16 h-16 flex items-center justify-center border-4 border-black mb-6"
          style={{ backgroundColor: color, boxShadow: `4px 4px 0px ${shadowColor}` }}
        >
          {icon}
        </div>
      )}

      {title && (
        <h3 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
          {title}
        </h3>
      )}

      <div className="text-base font-bold leading-relaxed flex-grow">
        {children}
      </div>
    </motion.div>
  );
};

export default NeoBrutalismCard;
