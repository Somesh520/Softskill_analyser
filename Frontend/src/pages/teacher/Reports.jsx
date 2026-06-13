import React, { useState, useEffect } from 'react';
  import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useNavigate } from 'react-router-dom';
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
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader,
} from 'lucide-react';
import Sidebar, { SidebarProvider } from '../../components/layout/Sidebar';
import { getTeacherReportsSummary, getClasses } from '../../api/teacherApi';

const TeacherReports = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [classPerformance, setClassPerformance] = useState([]);
  const [scoringTrend, setScoringTrend] = useState([]);
  const [criteriaBreakdown, setCriteriaBreakdown] = useState([]);
  const [completionRate, setCompletionRate] = useState(null);
  const [improvement, setImprovement] = useState(null);
  const [topCriterion, setTopCriterion] = useState(null);

  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userString) navigate('/login');
    const user = JSON.parse(userString);
    setTeacherData(user);
    
    fetchInitialData();
  }, [navigate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const classesData = await getClasses();
      setClassList(classesData || []);

      const summary = await getTeacherReportsSummary('all');
      setStats(summary.stats);
      setActivities(summary.activityPerformance || []);
      setClassPerformance(summary.classPerformance || []);
      setScoringTrend(summary.scoringTrend || []);
      setCriteriaBreakdown(summary.criteriaBreakdown || []);
      setCompletionRate(summary.completionRate);
      setImprovement(summary.improvement);
      setTopCriterion(summary.topCriterion);
    } catch (err) {
      console.error('Failed to fetch initial reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    try {
      setLoading(true);
      setError(null);
      const summary = await getTeacherReportsSummary(classId);
      setStats(summary.stats);
      setActivities(summary.activityPerformance || []);
      setClassPerformance(summary.classPerformance || []);
      setScoringTrend(summary.scoringTrend || []);
      setCriteriaBreakdown(summary.criteriaBreakdown || []);
      setCompletionRate(summary.completionRate);
      setImprovement(summary.improvement);
      setTopCriterion(summary.topCriterion);
    } catch (err) {
      console.error(`Failed to fetch reports for class ${classId}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Default stats if data not loaded
  const teacherStats = stats ? [
    { label: 'Total Activities', value: stats.totalActivities.toString(), change: `+${stats.totalActivities}`, icon: Activity, color: '#FFEB3B' },
    { label: 'Total Classes', value: stats.totalClasses.toString(), change: 'Assigned', icon: Users, color: '#00FFFF' },
    { label: 'Avg Student Score', value: `${stats.avgScore}%`, change: '+8%', icon: TrendingUp, color: '#00FF00' },
    { label: 'Activities Graded', value: stats.totalSubmissions.toString(), change: `+${stats.totalSubmissions}`, icon: Award, color: '#FF00FF' },
  ] : [
    { label: 'Total Activities', value: '0', change: '0', icon: Activity, color: '#FFEB3B' },
    { label: 'Total Classes', value: '0', change: 'Pending', icon: Users, color: '#00FFFF' },
    { label: 'Avg Student Score', value: '0%', change: '0%', icon: TrendingUp, color: '#00FF00' },
    { label: 'Activities Graded', value: '0', change: '0', icon: Award, color: '#FF00FF' },
  ];

  const COLORS = ['#FF00FF', '#00FFFF', '#FFEB3B', '#00FF00', '#FF6B6B'];

  if (!teacherData) return null;

  if (loading) {
  return <div className="flex-1 p-6 lg:p-8 space-y-8">

      {/* Banner */}
      <div className="border-[8px] border-black p-6 bg-white shadow-[12px_12px_0px_#999]">
        <div className="flex items-center gap-6">

          <Skeleton
            variant="rectangular"
            width={100}
            height={100}
            sx={{
              bgcolor: "#d1d5db",
              border: "4px solid black",
            }}
          />

          <div className="flex-1 space-y-4">
            <Skeleton
              variant="text"
              width="50%"
              height={70}
              sx={{ bgcolor: "#d1d5db" }}
            />

            <Skeleton
              variant="rectangular"
              width="60%"
              height={40}
              sx={{
                bgcolor: "#d1d5db",
                border: "3px solid black",
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="border-[8px] border-black p-6 bg-white shadow-[10px_10px_0px_black]"
          >
            <div className="flex items-start justify-between mb-6">
              <Skeleton
                variant="rectangular"
                width={70}
                height={70}
                sx={{
                  bgcolor: "#d1d5db",
                  border: "4px solid black",
                }}
              />

              <Skeleton
                variant="rectangular"
                width={50}
                height={35}
                sx={{
                  bgcolor: "#d1d5db",
                  border: "3px solid black",
                }}
              />
            </div>

            <Stack spacing={2}>
              <Skeleton
                variant="text"
                width="80%"
                height={35}
                sx={{ bgcolor: "#d1d5db" }}
              />

              <Skeleton
                variant="text"
                width="40%"
                height={60}
                sx={{ bgcolor: "#d1d5db" }}
              />
            </Stack>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="border-[8px] border-black p-8 bg-white shadow-[10px_10px_0px_black]"
          >
            <Skeleton
              variant="text"
              width="50%"
              height={50}
              sx={{ bgcolor: "#d1d5db", mb: 4 }}
            />

            <Skeleton
              variant="rectangular"
              width="100%"
              height={320}
              sx={{
                bgcolor: "#d1d5db",
                border: "3px dashed black",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  }

  if (error) {
    return (
      <div className="flex-1 p-6 lg:p-8">
        <div className="bg-[#FF6B6B] border-8 border-black p-8">
          <p className="text-2xl font-black uppercase text-white mb-4">❌ Error Loading Reports</p>
          <p className="text-white font-bold mb-4">{error}</p>
          <button
            onClick={fetchInitialData}
            className="bg-white border-4 border-black p-4 font-black uppercase hover:bg-[#FFEB3B] transition-all"
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
            className="mb-10 bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] border-8 border-black p-8 relative overflow-hidden"
            style={{ boxShadow: '16px 16px 0px rgba(0,0,0,0.4)' }}
          >
            <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-[#FFEB3B] opacity-20 border-4 border-black rotate-45"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="bg-white p-4 border-4 border-black text-black transform -rotate-3" style={{ boxShadow: '6px 6px 0px #000' }}>
                <BarChart3 size={48} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 leading-tight tracking-tighter text-white drop-shadow-lg">ACTIVITY REPORTS</h2>
                <p className="text-sm font-black text-white uppercase tracking-widest bg-black inline-block px-3 py-1 border-2 border-white">Track Your Activities & Student Performance</p>
              </div>
            </div>
          </motion.div>

          {/* Class Filter Dropdown Selector */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border-8 border-black p-6" style={{ boxShadow: '12px 12px 0px #000' }}>
            <div>
              <label htmlFor="class-selector" className="text-lg font-black uppercase text-black block mb-1">
                Filter by Class
              </label>
              <p className="text-sm font-bold text-gray-500 uppercase">
                Choose a specific class or view overall combined reports
              </p>
            </div>
            <div className="relative">
              <select
                id="class-selector"
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full sm:w-72 bg-white border-4 border-black p-3 pr-10 font-black uppercase text-black appearance-none focus:outline-none focus:bg-[#FFEB3B] cursor-pointer"
                style={{ borderRadius: 0 }}
              >
                <option value="all">Mix / All Classes</option>
                {classList.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.section || 'A'})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black font-black text-lg">
                ▼
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {teacherStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border-6 border-black p-6 hover:shadow-2xl transition-all"
                  style={{ boxShadow: '8px 8px 0px #000' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-white p-3 border-4 border-black" style={{ backgroundColor: stat.color }}>
                      <Icon size={32} className="text-black" strokeWidth={2} />
                    </div>
                    <span className={`text-xs font-black px-2 py-1 border-2 border-black ${
                      stat.change.includes('+') ? 'bg-[#00FF00]' : stat.change.includes('-') ? 'bg-[#FF6B6B]' : 'bg-[#FFEB3B]'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-700 uppercase">{stat.label}</p>
                  <p className="text-4xl font-black mt-2">{stat.value}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            
            {/* Activity Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                📊 ACTIVITY PERFORMANCE
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activities} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                  <XAxis dataKey="name" stroke="#000" />
                  <YAxis stroke="#000" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFEB3B',
                      border: '3px solid #000',
                      borderRadius: 0,
                      fontWeight: 'bold',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avg" fill="#FF00FF" stroke="#000" strokeWidth={2} name="Avg Score %" />
                  <Bar dataKey="submitted" fill="#00FFFF" stroke="#000" strokeWidth={2} name="Submitted" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Class/Student Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                {selectedClass === 'all' ? '👥 CLASS PERFORMANCE' : '👥 STUDENT PERFORMANCE (TOP 12)'}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classPerformance} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                  <XAxis dataKey="name" stroke="#000" />
                  <YAxis stroke="#000" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFEB3B',
                      border: '3px solid #000',
                      borderRadius: 0,
                      fontWeight: 'bold',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avg" fill="#00FF00" stroke="#000" strokeWidth={2} name={selectedClass === 'all' ? 'Average %' : 'Avg Score %'} />
                  <Bar dataKey="students" fill="#00FFFF" stroke="#000" strokeWidth={2} name={selectedClass === 'all' ? 'Total Students' : 'Evaluations'} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            
            {/* Scoring Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                📈 SCORING TREND
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoringTrend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                  <XAxis dataKey="week" stroke="#000" />
                  <YAxis stroke="#000" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFEB3B',
                      border: '3px solid #000',
                      borderRadius: 0,
                      fontWeight: 'bold',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#FF00FF"
                    strokeWidth={3}
                    dot={{ fill: '#000', r: 5 }}
                    name="Average Score %"
                  />
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="#00FF00"
                    strokeWidth={2}
                    dot={{ fill: '#000', r: 4 }}
                    name="Highest"
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="#FF6B6B"
                    strokeWidth={2}
                    dot={{ fill: '#000', r: 4 }}
                    name="Lowest"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Criteria Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                🎯 CRITERIA BREAKDOWN
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={criteriaBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={2}
                  >
                    {criteriaBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFEB3B',
                      border: '3px solid #000',
                      borderRadius: 0,
                      fontWeight: 'bold',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Detailed Activity Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white border-8 border-black p-8 mb-10"
            style={{ boxShadow: '12px 12px 0px #000' }}
          >
            <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
              📋 ACTIVITY DETAILS
            </h3>
            
            <div className="overflow-x-auto border-6 border-black">
              <div className="bg-black text-white border-b-4 border-black flex font-black uppercase text-sm">
                <div className="flex-1 min-w-40 p-4 border-r-4 border-white">ACTIVITY</div>
                <div className="w-24 min-w-24 p-4 border-r-4 border-white text-center">AVG %</div>
                <div className="w-28 min-w-28 p-4 border-r-4 border-white text-center">HIGHEST</div>
                <div className="w-28 min-w-28 p-4 border-r-4 border-white text-center">LOWEST</div>
                <div className="w-32 min-w-32 p-4 text-center">SUBMITTED</div>
              </div>
              {activities.length === 0 ? (
                <div className="p-8 text-center font-bold text-gray-500 bg-gray-50 uppercase border-b-2 border-black last:border-b-0">
                  No activities found. Create an activity and upload marks to see reports.
                </div>
              ) : (
                activities.map((act, idx) => (
                  <div 
                    key={act.id || idx} 
                    className={`flex font-bold text-sm border-b-2 border-black last:border-b-0 hover:bg-gray-100 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 min-w-40 p-4 border-r-2 border-black flex flex-col justify-center">
                      <span className="font-black text-base uppercase text-black">{act.name}</span>
                      <span className="text-xs text-gray-500 font-bold uppercase">{act.type} • Due {new Date(act.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="w-24 min-w-24 p-4 border-r-2 border-black text-center flex items-center justify-center font-black text-lg text-[#FF00FF]">
                      {act.avg}%
                    </div>
                    <div className="w-28 min-w-28 p-4 border-r-2 border-black text-center flex items-center justify-center text-[#00FF00] font-black">
                      {act.highest}%
                    </div>
                    <div className="w-28 min-w-28 p-4 border-r-2 border-black text-center flex items-center justify-center text-[#FF6B6B] font-black">
                      {act.lowest}%
                    </div>
                    <div className="w-32 min-w-32 p-4 text-center flex items-center justify-center font-black text-black">
                      {act.submitted}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-[#00FF00] to-[#00FFFF] border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h4 className="text-lg font-black uppercase mb-2 flex items-center gap-2">
                <CheckCircle2 size={24} /> COMPLETION RATE
              </h4>
              <p className="text-5xl font-black">{completionRate ? `${completionRate.rate}%` : '0%'}</p>
              <p className="text-sm font-bold mt-2">
                {completionRate ? `${completionRate.submitted} of ${completionRate.expected} students` : '0 of 0 students'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-[#FF00FF] to-[#FFEB3B] border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h4 className="text-lg font-black uppercase mb-2 flex items-center gap-2">
                <TrendingUp size={24} /> IMPROVEMENT
              </h4>
              <p className="text-4xl font-black">
                {improvement ? `${improvement.value >= 0 ? '+' : ''}${improvement.value}%` : '0%'}
              </p>
              <p className="text-sm font-bold mt-2">
                {improvement ? improvement.label : 'No trend data yet'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-br from-[#FFEB3B] to-[#FF00FF] border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h4 className="text-lg font-black uppercase mb-2 flex items-center gap-2">
                <Award size={24} /> TOP CRITERIA
              </h4>
              <p className="text-3xl font-black">{topCriterion && topCriterion.name !== 'None' ? topCriterion.name : 'N/A'}</p>
              <p className="text-sm font-bold mt-2">
                {topCriterion && topCriterion.name !== 'None' ? `${topCriterion.count} evaluations ⭐` : 'No evaluations yet'}
              </p>
            </motion.div>
          </div>

        </main>
    </div>
  );
};

export default TeacherReports;
