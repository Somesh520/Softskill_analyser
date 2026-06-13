import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart as ChartIcon, AlertCircle, RefreshCw, Award } from 'lucide-react';
import Skeleton from '@mui/material/Skeleton';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { getStudentDashboardSummary } from '../../api/studentApi';

const SemesterReport = () => {
  const [performance, setPerformance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentReport();
  }, []);

  const fetchStudentReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await getStudentDashboardSummary();
      setPerformance(summary.performance || []);
      setStats(summary.stats);
    } catch (err) {
      console.error('Failed to load student report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 space-y-8">
        <Skeleton variant="text" width="40%" height={60} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton variant="rectangular" height={380} className="border-8 border-black shadow-[10px_10px_0px_#000] bg-white" />
          <Skeleton variant="rectangular" height={380} className="border-8 border-black shadow-[10px_10px_0px_#000] bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-[#FF6B6B] border-8 border-black p-8 shadow-[12px_12px_0px_#000]">
          <p className="text-2xl font-black uppercase text-white mb-4 flex items-center gap-3">
            <AlertCircle size={32} /> Error Loading Report
          </p>
          <p className="text-white font-bold mb-4">{error}</p>
          <button
            onClick={fetchStudentReport}
            className="bg-white border-4 border-black p-4 font-black uppercase hover:bg-[#FFEB3B] transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasPerformanceData = performance.length > 0;

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-[#00FFFF] p-3 border-4 border-black text-black" style={{ boxShadow: '4px 4px 0px #000' }}>
              <ChartIcon size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Soft Skill Analytics</h1>
          </div>
          <button 
            onClick={fetchStudentReport}
            className="bg-white hover:bg-gray-100 border-4 border-black p-3 font-black text-black flex items-center gap-2 transform active:translate-y-1 transition-all"
            style={{ boxShadow: '4px 4px 0px #000' }}
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        {/* Analytics Breakdown */}
        {!hasPerformanceData ? (
          <div className="bg-white border-8 border-black p-10 text-center" style={{ boxShadow: '12px 12px 0px #000' }}>
            <p className="text-2xl font-black uppercase text-gray-500">No evaluations graded yet</p>
            <p className="text-gray-500 font-bold uppercase mt-2">Charts will appear once your teacher uploads marks and feedback for your activities.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Top Score Banner */}
            <div className="bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] border-8 border-black p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ boxShadow: '12px 12px 0px #000' }}>
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 border-4 border-black text-black">
                  <Award size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase text-white drop-shadow-md">Your Soft Skill Score</h3>
                  <p className="text-sm font-black text-white uppercase tracking-widest bg-black inline-block px-2 py-0.5 mt-0.5">Across All Completed Activities</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-5xl font-black text-white bg-black px-6 py-2 border-4 border-white inline-block">
                  {stats?.avgScore || 0}%
                </span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-8 border-black p-6 md:p-8"
                style={{ boxShadow: '12px 12px 0px #000' }}
              >
                <h3 className="text-2xl font-black uppercase mb-6 text-black border-b-4 border-black pb-2">
                  🎯 SKILL DISTRIBUTION
                </h3>
                <div className="h-[320px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performance}>
                      <PolarGrid stroke="#000" strokeWidth={1.5} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontWeight: 'bold', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#000', fontWeight: 'bold' }} />
                      <Radar
                        name="My Score"
                        dataKey="A"
                        stroke="#FF00FF"
                        fill="#FF00FF"
                        fillOpacity={0.4}
                        strokeWidth={3}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFEB3B',
                          border: '3px solid #000',
                          borderRadius: 0,
                          fontWeight: 'bold',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Bar Chart */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white border-8 border-black p-6 md:p-8"
                style={{ boxShadow: '12px 12px 0px #000' }}
              >
                <h3 className="text-2xl font-black uppercase mb-6 text-black border-b-4 border-black pb-2">
                  📊 CRITERIA PERFORMANCE
                </h3>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performance} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="subject" stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} />
                      <YAxis stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFEB3B',
                          border: '3px solid #000',
                          borderRadius: 0,
                          fontWeight: 'bold',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="A" fill="#00FF00" name="Score %" stroke="#000" strokeWidth={2} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SemesterReport;
