import React from 'react';
import { motion } from 'framer-motion';

const NeoBrutalismButton = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = ''
}) => {
  const getVariantClasses = () => {
    switch(variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm';
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-foreground border border-border shadow-sm';
      case 'white':
        return 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm';
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm';
    }
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-6 py-3 font-semibold text-sm rounded-md transition-all ${getVariantClasses()} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default NeoBrutalismButton;
