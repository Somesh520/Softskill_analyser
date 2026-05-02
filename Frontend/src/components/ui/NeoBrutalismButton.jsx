import React from 'react';
import { motion } from 'framer-motion';

const NeoBrutalismButton = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  shadowColor = '#000'
}) => {
  const colors = {
    primary: '#FFEB3B',   // Yellow
    secondary: '#00FFFF', // Cyan
    accent: '#FF00FF',    // Magenta
    white: '#FFFFFF',
    black: '#000000',
  };

  const bgColor = colors[variant] || variant;

  return (
    <motion.button
      whileHover={{ x: -2, y: -2, boxShadow: `6px 6px 0px ${shadowColor}` }}
      whileTap={{ x: 2, y: 2, boxShadow: `0px 0px 0px ${shadowColor}` }}
      onClick={onClick}
      className={`px-8 py-4 text-black font-black text-lg uppercase border-4 border-black transition-all ${className}`}
      style={{ 
        backgroundColor: bgColor,
        boxShadow: `4px 4px 0px ${shadowColor}`,
      }}
    >
      {children}
    </motion.button>
  );
};

export default NeoBrutalismButton;
