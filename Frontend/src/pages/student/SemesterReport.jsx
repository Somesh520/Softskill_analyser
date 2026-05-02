import React from 'react';
import { motion } from 'framer-motion';
import { BarChart } from 'lucide-react';

const SemesterReport = () => {
  return (
    <div className="p-6 lg:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#00FFFF] p-3 border-4 border-black" style={{ boxShadow: '4px 4px 0px #000' }}>
            <BarChart size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Semester Report</h1>
        </div>
        <div className="bg-white border-8 border-black p-8" style={{ boxShadow: '12px 12px 0px #000' }}>
          <p className="text-xl font-bold uppercase">Coming Soon — Radar charts & bar graphs for your skills will be built here.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SemesterReport;
