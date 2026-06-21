"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Award,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
  Activity,
  Loader,
} from 'lucide-react';
import { getCollegeAnalytics, getClassPerformance, getDepartmentAnalytics, getPerformanceDistribution, getActivityAnalytics } from '../../../api/adminApi';

const COLORS = ['#00FFFF', '#FF00FF', '#00FF00', '#FFEB3B', '#FF4500', '#1E90FF'];

const CollegeReport = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [collegeStats, setCollegeStats] = useState(null);
  const [classPerformance, setClassPerformance] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [performanceDistribution, setPerformanceDistribution] = useState([]);
  const [activityAnalytics, setActivityAnalytics] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stats, classPerf, depts, perfDist, activities] = await Promise.all([
        getCollegeAnalytics(),
        getClassPerformance(),
        getDepartmentAnalytics(),
        getPerformanceDistribution(),
        getActivityAnalytics()
      ]);

      setCollegeStats(stats);
      setClassPerformance(classPerf || []);
      setDepartmentData(depts || []);
      setPerformanceDistribution(perfDist || []);
      setActivityAnalytics(activities || []);
      setSelectedClass('All');
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const defaultStats = [
    { label: 'Total Students', value: 0, change: '0%', icon: Users, color: '#00FFFF' },
    { label: 'Avg Performance', value: 0, change: '0%', icon: TrendingUp, color: '#00FF00' },
    { label: 'Total Activities', value: 0, change: '0', icon: Activity, color: '#FFEB3B' },
    { label: 'Classes Evaluated', value: 0, change: 'Pending', icon: Award, color: '#FF00FF' },
  ];

  const overallStats = collegeStats ? [
    { label: 'Total Students', value: collegeStats.totalStudents?.toLocaleString() || '0', change: '+12%', icon: Users, color: '#00FFFF' },
    { label: 'Avg Performance', value: `${collegeStats.avgPerformance?.toFixed(1) || 0}%`, change: '+5%', icon: TrendingUp, color: '#00FF00' },
    { label: 'Total Activities', value: collegeStats.totalActivities?.toLocaleString() || '0', change: `+${collegeStats.totalActivities || 0}`, icon: Activity, color: '#FFEB3B' },
    { label: 'Classes Evaluated', value: collegeStats.totalClasses?.toLocaleString() || '0', change: collegeStats.totalClasses ? 'Full' : 'Pending', icon: Award, color: '#FF00FF' },
  ] : defaultStats;

  const performanceTrendData = [
    { month: 'Week 1', avg: 45 },
    { month: 'Week 2', avg: 52 },
    { month: 'Week 3', avg: 61 },
    { month: 'Week 4', avg: 58 },
    { month: 'Week 5', avg: 72 },
    { month: 'Week 6', avg: collegeStats?.avgPerformance || 78.5 },
  ];

  const radarData = performanceDistribution.map(item => ({
    subject: item.range,
    A: item.count,
    fullMark: Math.max(...performanceDistribution.map(d => d.count), 10)
  }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Loader size={64} className="animate-spin text-black" strokeWidth={2} />
          <p className="text-2xl font-black uppercase text-black">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 lg:p-8">
        <div className="bg-[#FF6B6B] border-8 border-black p-8">
          <p className="text-2xl font-black uppercase text-white mb-4">❌ Error Loading Analytics</p>
          <p className="text-white font-bold mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="bg-white border-4 border-black p-4 font-black uppercase hover:bg-[#FFEB3B] transition-all cursor-pointer text-black"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] border-8 border-black p-8 relative overflow-hidden"
            style={{ boxShadow: '16px 16px 0px rgba(0,0,0,0.4)' }}
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#FFEB3B] opacity-20 border-4 border-black rotate-45"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="bg-white p-4 border-4 border-black text-black transform rotate-3" style={{ boxShadow: '6px 6px 0px #000' }}>
                <BarChart3 size={48} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 leading-tight tracking-tighter text-white drop-shadow-lg">COLLEGE ANALYTICS</h2>
                <p className="text-sm font-black text-white uppercase tracking-widest bg-black inline-block px-3 py-1 border-2 border-white">Overall Performance & Insights Dashboard</p>
              </div>
            </div>
          </motion.div>

          {/* Overall Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {overallStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border-6 border-black p-6 group hover:shadow-2xl transition-all"
                  style={{ boxShadow: '8px 8px 0px #000' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-white p-3 border-4 border-black" style={{ backgroundColor: stat.color }}>
                      <Icon size={32} className="text-black" strokeWidth={2} />
                    </div>
                    <span className={`text-xs font-black px-2 py-1 border-2 border-black text-black ${
                      stat.change.includes('+') ? 'bg-[#00FF00]' : stat.change.includes('-') ? 'bg-[#FF6B6B]' : 'bg-[#FFEB3B]'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-700 uppercase">{stat.label}</p>
                  <p className="text-4xl font-black mt-2 text-black">{stat.value}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            
            {/* Class Performance Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-black">
                📊 CLASS PERFORMANCE
              </h3>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classPerformance.slice(0, 6)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                    <XAxis dataKey="name" stroke="#000" />
                    <YAxis stroke="#000" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFEB3B',
                        border: '3px solid #000',
                        borderRadius: 0,
                        fontWeight: 'bold',
                        color: 'black',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="avgPercentage" fill="#FF00FF" stroke="#000" strokeWidth={3} name="Average %" />
                    <Bar dataKey="totalSubmissions" fill="#00FFFF" stroke="#000" strokeWidth={3} name="Submitted" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Department Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-black">
                🏢 DEPARTMENTS
              </h3>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#000"
                      strokeWidth={2}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFEB3B',
                        border: '3px solid #000',
                        borderRadius: 0,
                        fontWeight: 'bold',
                        color: 'black',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            
            {/* Performance Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-black">
                📈 PERFORMANCE TREND
              </h3>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                    <XAxis dataKey="month" stroke="#000" />
                    <YAxis stroke="#000" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFEB3B',
                        border: '3px solid #000',
                        borderRadius: 0,
                        fontWeight: 'bold',
                        color: 'black',
                      }}
                    />
                    <Legend />
                    <Line
                      type="stepAfter"
                      dataKey="avg"
                      stroke="#00FF00"
                      strokeWidth={4}
                      dot={{ fill: '#000', r: 6, strokeWidth: 2, stroke: '#fff' }}
                      name="Growth Scale"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Section-wise Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-black">
                🎯 SCORE DISTRIBUTION
              </h3>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#000" />
                    <PolarAngleAxis dataKey="subject" stroke="#000" fontStyle={{ fontWeight: 'black' }} />
                    <PolarRadiusAxis stroke="#000" />
                    <Radar
                      name="Student Count"
                      dataKey="A"
                      stroke="#FF00FF"
                      fill="#FF00FF"
                      fillOpacity={0.6}
                      strokeWidth={3}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFEB3B',
                        border: '3px solid #000',
                        borderRadius: 0,
                        fontWeight: 'black',
                        color: 'black',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Detailed Class Breakdown Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white border-8 border-black p-8"
            style={{ boxShadow: '12px 12px 0px #000' }}
          >
            <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-black">
              📋 DETAILED CLASS METRICS
            </h3>
            
            <div className="overflow-x-auto border-6 border-black">
              <div className="bg-black text-white border-b-4 border-black flex font-black uppercase text-sm">
                <div className="flex-1 min-w-32 p-4 border-r-4 border-white">CLASS</div>
                <div className="w-24 min-w-24 p-4 border-r-4 border-white text-center">AVG %</div>
                <div className="w-28 min-w-28 p-4 border-r-4 border-white text-center">TOTAL</div>
                <div className="w-32 min-w-32 p-4 border-r-4 border-white text-center">SUBMITTED</div>
                <div className="w-28 min-w-28 p-4 text-center">PENDING</div>
              </div>

              <div className="divide-y-2 divide-black">
                {classPerformance.map((cls, idx) => (
                  <div key={idx} className="flex hover:bg-[#FFFACD] transition-all bg-white">
                    <div className="flex-1 min-w-32 p-4 border-r-2 border-gray-300 font-black text-lg text-black">{cls.name}</div>
                    <div className="w-24 min-w-24 p-4 border-r-2 border-gray-300 text-center">
                      <span className="bg-[#FF00FF] text-white px-2 py-1 font-black text-sm">{cls.avgPercentage}%</span>
                    </div>
                    <div className="w-28 min-w-28 p-4 border-r-2 border-gray-300 text-center font-bold text-black">{cls.totalStudents}</div>
                    <div className="w-32 min-w-32 p-4 border-r-2 border-gray-300 text-center font-bold">
                      <span className="bg-[#00FF00] text-black px-2 py-1 font-black text-sm">{cls.totalSubmissions}</span>
                    </div>
                    <div className="w-28 min-w-28 p-4 text-center font-bold">
                      <span className="bg-[#FFEB3B] text-black px-2 py-1 font-black text-sm">{cls.totalStudents - cls.totalSubmissions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-[#00FF00] to-[#00FFFF] border-8 border-black p-8 text-black"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h4 className="text-lg font-black uppercase mb-2">✅ SUBMISSION RATE</h4>
              <p className="text-5xl font-black">{collegeStats?.submissionRate || 0}%</p>
              <p className="text-sm font-bold mt-2">{collegeStats?.totalSubmissions || 0} total submissions</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-[#FF00FF] to-[#FFEB3B] border-8 border-black p-8 text-black"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h4 className="text-lg font-black uppercase mb-2">🎯 TOP PERFORMER</h4>
              <p className="text-3xl font-black">{classPerformance[0]?.name || 'N/A'}</p>
              <p className="text-sm font-bold mt-2">Average: {classPerformance[0]?.avgPercentage || 0}% ⭐</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-br from-[#FFEB3B] to-[#FF00FF] border-8 border-black p-8 text-black"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h4 className="text-lg font-black uppercase mb-2">📊 CONSISTENCY</h4>
              <p className="text-4xl font-black">+12%</p>
              <p className="text-sm font-bold mt-2">Overall Growth Metric</p>
            </motion.div>
          </div>

        </main>
    </div>
  );
};

export default CollegeReport;
