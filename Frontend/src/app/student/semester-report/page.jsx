"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart as ChartIcon, AlertCircle, RefreshCw, Award, TrendingUp, TrendingDown, Info, MessageSquare } from 'lucide-react';
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
import { getStudentDashboardSummary, getStudentDriftInsights } from '../../../api/studentApi';

const SemesterReport = () => {
  const [performance, setPerformance] = useState([]);
  const [stats, setStats] = useState(null);
  const [driftInsights, setDriftInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentReport();
  }, []);

  const fetchStudentReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summary, drift] = await Promise.all([
        getStudentDashboardSummary(),
        getStudentDriftInsights()
      ]);
      setPerformance(summary.performance || []);
      setStats(summary.stats);
      setDriftInsights(drift || []);
    } catch (err) {
      console.error('Failed to load student report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 space-y-8 min-h-[500px]">
        <Skeleton variant="text" width="40%" height={60} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton variant="rectangular" height={380} className="rounded-2xl bg-card" />
          <Skeleton variant="rectangular" height={380} className="rounded-2xl bg-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10 flex flex-col flex-1 h-full w-full bg-background">
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl p-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <AlertCircle size={24} />
             <p className="font-semibold">{error}</p>
          </div>
          <button
            onClick={fetchStudentReport}
            className="px-4 py-2 bg-background border border-border rounded-lg shadow-sm font-semibold hover:bg-accent transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasPerformanceData = performance.length > 0;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8 bg-card border border-border rounded-2xl shadow-sm p-8 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none"></div>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
               <div className="flex items-center gap-6">
                 <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl text-primary flex items-center justify-center shrink-0">
                   <ChartIcon size={48} strokeWidth={2} />
                 </div>
                 <div>
                   <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">Soft Skill Analytics</h2>
                   <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">
                     Semester Overview
                   </p>
                 </div>
               </div>
               <button 
                 onClick={fetchStudentReport}
                 className="bg-card hover:bg-accent border border-border rounded-lg shadow-sm px-4 py-2 font-semibold text-foreground flex items-center gap-2 transition-colors"
               >
                 <RefreshCw size={18} /> Refresh
               </button>
             </div>
          </div>

          {/* Analytics Breakdown */}
          {!hasPerformanceData ? (
            <div className="text-center py-16 border border-border border-dashed rounded-2xl bg-card shadow-sm">
              <ChartIcon size={48} className="mx-auto text-foreground/20 mb-4" />
              <p className="font-bold text-foreground/50 text-xl">No evaluations graded yet</p>
              <p className="text-foreground/40 font-semibold mt-2">Charts will appear once your teacher uploads marks and feedback for your activities.</p>
            </div>
          ) : (
          <div className="space-y-10">
            {/* Top Score Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl shadow-sm p-8 flex flex-col sm:flex-row items-center justify-between gap-6" >
              <div className="flex items-center gap-6">
                <div className="bg-primary/10 text-primary p-4 rounded-xl">
                  <Award size={40} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">Your Soft Skill Score</h3>
                  <p className="text-sm font-semibold text-foreground/50 mt-1 uppercase tracking-wider">Across All Completed Activities</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-6xl font-extrabold text-primary">
                  {stats?.avgScore || 0}<span className="text-4xl text-primary/70">%</span>
                </span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8"
              >
                <h3 className="text-xl font-bold mb-6 text-foreground border-b border-border/50 pb-4 flex items-center gap-2">
                  <ChartIcon size={20} className="text-primary" /> Skill Distribution
                </h3>
                <div className="h-[320px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={performance}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, opacity: 0.7 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--foreground))', opacity: 0.5 }} />
                      <Radar
                        name="My Score"
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
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
                className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8"
              >
                <h3 className="text-xl font-bold mb-6 text-foreground border-b border-border/50 pb-4 flex items-center gap-2">
                  <ChartIcon size={20} className="text-primary" /> Criteria Performance
                </h3>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performance} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="subject" stroke="hsl(var(--foreground))" opacity={0.5} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="hsl(var(--foreground))" opacity={0.5} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                        cursor={{fill: 'hsl(var(--foreground)/0.05)'}}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="A" fill="hsl(var(--primary))" name="Score %" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Growth Insights Section */}
        {driftInsights.length > 0 && (
          <div className="mt-12 space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3 border-b border-border/50 pb-4">
              <span className="bg-primary/10 text-primary p-2 rounded-xl"><TrendingUp size={24} /></span>
              Adaptive Growth Insights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {driftInsights.map((insight, idx) => (
                <motion.div
                  key={insight._id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`border rounded-2xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden ${insight.driftDirection === 'positive' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                >
                  <div className={`absolute top-0 left-0 w-2 h-full ${insight.driftDirection === 'positive' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  
                  <div className="flex justify-between items-start pl-4">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${insight.driftDirection === 'positive' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                        {insight.driftDirection === 'positive' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {insight.driftDirection === 'positive' ? 'Breakthrough' : 'Attention Needed'}
                      </span>
                      <h4 className="text-xl font-bold capitalize text-foreground">{insight.skillType}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground/50 font-semibold mb-1">Shift</p>
                      <p className={`text-2xl font-extrabold ${insight.driftDirection === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {insight.driftMagnitude > 0 ? '+' : ''}{insight.driftMagnitude.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="pl-4">
                    <p className="text-sm text-foreground/70 flex items-center gap-2 mb-4 font-medium">
                      <Info size={16} className="text-primary" />
                      Triggered by: <span className="font-bold text-foreground">{insight.activityTitle}</span>
                    </p>
                    
                    {insight.linkedFeedback && (
                      <div className="bg-background border border-border/50 rounded-xl p-4 flex gap-3 shadow-sm">
                        <MessageSquare size={20} className="text-primary/70 shrink-0 mt-0.5" />
                        <p className="text-sm italic text-foreground/80 leading-relaxed font-medium">
                          "{insight.linkedFeedback}"
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      </main>
    </div>
  );
};

export default SemesterReport;
