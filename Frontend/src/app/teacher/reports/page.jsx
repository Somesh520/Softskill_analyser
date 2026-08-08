"use client";
import React, { useState } from 'react';
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer } from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader } from 'lucide-react';
import { getTeacherReportsSummary, getClasses } from '../../../api/teacherApi';
import { useAuth } from '../../../context/AuthContext';

const TeacherReports = () => {
  const router = useRouter();
  const { user: teacherData } = useAuth();
  const [selectedClass, setSelectedClass] = useState('all');

  // Fetch classes list via TanStack Query
  const { data: classList = [], isLoading: classesLoading } = useQuery({
    queryKey: ['teacherClasses'],
    queryFn: getClasses,
    enabled: !!teacherData });

  // Fetch reports summary based on selected class
  const { data: summary = {}, isLoading: summaryLoading, error: queryError } = useQuery({
    queryKey: ['teacherReportsSummary', selectedClass],
    queryFn: () => getTeacherReportsSummary(selectedClass),
    enabled: !!teacherData });

  const loading = classesLoading || summaryLoading;
  const error = queryError ? queryError.message : null;

  // Extract stats and lists from summary
  const stats = summary.stats || null;
  const activities = summary.activityPerformance || [];
  const classPerformance = summary.classPerformance || [];
  const scoringTrend = summary.scoringTrend || [];
  const criteriaBreakdown = summary.criteriaBreakdown || [];
  const completionRate = summary.completionRate || null;
  const improvement = summary.improvement || null;
  const topCriterion = summary.topCriterion || null;

  // Default stats if data not loaded
  const teacherStats = stats ? [
    { label: 'Total Activities', value: stats.totalActivities.toString(), change: `+${stats.totalActivities}` },
    { label: 'Total Classes', value: stats.totalClasses.toString(), change: 'Assigned' },
    { label: 'Avg Student Score', value: `${stats.avgScore}%`, change: '+8%' },
    { label: 'Activities Graded', value: stats.totalSubmissions.toString(), change: `+${stats.totalSubmissions}` },
  ] : [
    { label: 'Total Activities', value: '0', change: '0' },
    { label: 'Total Classes', value: '0', change: 'Pending' },
    { label: 'Avg Student Score', value: '0%', change: '0%' },
    { label: 'Activities Graded', value: '0', change: '0' },
  ];

  // Theme-aware colors
  const chartColors = {
    primary: 'var(--primary)',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    muted: 'hsl(var(--muted))',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']; // Fallback colors, better to use CSS vars if possible, Recharts prefers hex.

  const customTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--foreground))',
    fontSize: '12px',
    fontWeight: '500',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
  };

  if (!teacherData) return null;

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-8 space-y-8 bg-background">
        {/* Banner Skeleton */}
        <div className="rounded-2xl p-6 bg-card border border-border shadow-sm">
          <div className="flex items-center gap-6">
            <Skeleton variant="rounded" width={80} height={80} sx={{ bgcolor: "var(--border)" }} />
            <div className="flex-1 space-y-4">
              <Skeleton variant="text" width="40%" height={40} sx={{ bgcolor: "var(--border)" }} />
              <Skeleton variant="rounded" width="30%" height={30} sx={{ bgcolor: "var(--border)" }} />
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-2xl p-6 bg-card border border-border shadow-sm">
              <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: "var(--border)", mb: 2 }} />
              <Skeleton variant="text" width="40%" height={48} sx={{ bgcolor: "var(--border)" }} />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {[1, 2].map((item) => (
            <div key={item} className="rounded-2xl p-8 bg-card border border-border shadow-sm">
              <Skeleton variant="text" width="40%" height={32} sx={{ bgcolor: "var(--border)", mb: 6 }} />
              <Skeleton variant="rounded" width="100%" height={300} sx={{ bgcolor: "var(--border)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 lg:p-8 bg-background">
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle size={48} className="mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Reports</h2>
          <p className="font-medium mb-6">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="bg-red-500 text-white rounded-xl px-6 py-3 font-semibold hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 p-6 lg:p-10 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-card border border-border rounded-2xl shadow-sm p-8 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl text-primary" >
              <BarChart3 size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">Activity Reports</h2>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">
                Track Your Activities & Student Performance
              </p>
            </div>
          </div>
        </motion.div>

        {/* Class Filter Dropdown Selector */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border rounded-2xl shadow-sm p-6" >
          <div>
            <label htmlFor="class-selector" className="text-sm font-semibold text-foreground/80 block mb-1">
              Filter by Class
            </label>
            <p className="text-xs font-medium text-foreground/50">
              Choose a specific class or view overall combined reports
            </p>
          </div>
          <div className="relative">
            <select
              id="class-selector"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full sm:w-72 bg-background border border-border rounded-xl shadow-sm p-3 pr-10 font-medium text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="all">Mix / All Classes</option>
              {classList.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.section || 'A'})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground/50 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {teacherStats.map((stat, idx) => {
            const isPositive = stat.change.includes('+');
            const isNegative = stat.change.includes('-');
            const changeColor = isPositive ? 'text-green-500 bg-green-500/10' : isNegative ? 'text-red-500 bg-red-500/10' : 'text-foreground/50 bg-foreground/5';
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-foreground/60">{stat.label}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${changeColor}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Activity size={20} className="text-primary"/> Activity Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activities} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="currentColor" className="text-foreground/50 text-xs" axisLine={false} tickLine={false} />
                <YAxis stroke="currentColor" className="text-foreground/50 text-xs" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} cursor={{fill: 'var(--muted)'}} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Score %" />
                <Bar dataKey="submitted" fill="#10b981" radius={[4, 4, 0, 0]} name="Submitted" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Class/Student Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Users size={20} className="text-primary"/> {selectedClass === 'all' ? 'Class Performance' : 'Student Performance (Top 12)'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="currentColor" className="text-foreground/50 text-xs" axisLine={false} tickLine={false} />
                <YAxis stroke="currentColor" className="text-foreground/50 text-xs" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} cursor={{fill: 'var(--muted)'}} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="avg" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={selectedClass === 'all' ? 'Average %' : 'Avg Score %'} />
                <Bar dataKey="students" fill="#f59e0b" radius={[4, 4, 0, 0]} name={selectedClass === 'all' ? 'Total Students' : 'Evaluations'} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Scoring Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary"/> Scoring Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoringTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="week" stroke="currentColor" className="text-foreground/50 text-xs" axisLine={false} tickLine={false} />
                <YAxis stroke="currentColor" className="text-foreground/50 text-xs" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Average Score %" />
                <Line type="monotone" dataKey="high" stroke="#10b981" strokeWidth={2} dot={false} name="Highest" />
                <Line type="monotone" dataKey="low" stroke="#ef4444" strokeWidth={2} dot={false} name="Lowest" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Criteria Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Award size={20} className="text-primary"/> Criteria Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={criteriaBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name.substring(0, 5)}.. ${percentage}%`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {criteriaBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Detailed Activity Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-border bg-card/50">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Activity Details
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-foreground/5 text-foreground/70 uppercase tracking-wider text-xs">
                  <th className="p-4 font-semibold">Activity</th>
                  <th className="p-4 font-semibold text-center">Avg %</th>
                  <th className="p-4 font-semibold text-center">Highest</th>
                  <th className="p-4 font-semibold text-center">Lowest</th>
                  <th className="p-4 font-semibold text-center">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-foreground/50 font-medium">
                      No activities found. Create an activity and upload marks to see reports.
                    </td>
                  </tr>
                ) : (
                  activities.map((act, idx) => (
                    <tr key={act.id || idx} className="hover:bg-foreground/5 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{act.name}</div>
                        <div className="text-xs text-foreground/50 mt-1">{act.type} • Due {new Date(act.dueDate).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 text-center font-bold text-blue-500">
                        {act.avg}%
                      </td>
                      <td className="p-4 text-center font-semibold text-green-500">
                        {act.highest}%
                      </td>
                      <td className="p-4 text-center font-semibold text-red-500">
                        {act.lowest}%
                      </td>
                      <td className="p-4 text-center font-medium text-foreground">
                        {act.submitted}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TeacherReports;
