import React from 'react';
import { motion } from 'framer-motion';

const NeoBrutalismMarquee = ({ items, speed = 20, color = "#00FFFF" }) => {
  return (
    <div className="relative w-full overflow-hidden bg-black py-6 border-y-4 border-black">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          duration: speed,
          ease: "linear",
        }}
      >
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            className="flex items-center mx-8"
          >
            <span className="text-4xl font-black uppercase" style={{ color }}>
              {item}
            </span>
            <span className="mx-8 text-4xl text-white font-black">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default NeoBrutalismMarquee;
