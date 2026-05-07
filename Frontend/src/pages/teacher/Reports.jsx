import React, { useState, useEffect } from 'react';
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
import { getActivities, getActivitySubmissions } from '../../api/teacherApi';

const TeacherReports = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userString) navigate('/login');
    const user = JSON.parse(userString);
    setTeacherData(user);
    
    // Fetch teacher's activities and submissions
    fetchTeacherReports();
  }, [navigate]);

  const fetchTeacherReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all activities for this teacher
      const activitiesData = await getActivities();
      setActivities(activitiesData || []);

      // Compile stats from activities
      const totalActivities = activitiesData?.length || 0;
      const totalSubmissions = activitiesData?.reduce((sum, act) => sum + (act.submissionCount || 0), 0) || 0;

      // Calculate average score from submissions
      let totalMarks = 0;
      let submissionCount = 0;
      const activityPerformance = [];

      for (const activity of activitiesData || []) {
        try {
          const submissions = await getActivitySubmissions(activity._id);
          const submissionCount_ = submissions?.length || 0;
          const avgMarks = submissions?.length > 0 
            ? submissions.reduce((sum, sub) => sum + (sub.totalMarks || 0), 0) / submissions.length
            : 0;

          totalMarks += avgMarks * submissionCount_;
          submissionCount += submissionCount_;

          if (activityPerformance.length < 6) {
            activityPerformance.push({
              name: activity.name || `Activity ${activity._id?.substring(0, 5)}`,
              avg: Math.round(avgMarks * 10) / 10,
              students: submissionCount_,
              submitted: submissionCount_
            });
          }
        } catch (err) {
          console.error('Error fetching submissions for activity:', err);
        }
      }

      const avgScore = submissionCount > 0 ? Math.round((totalMarks / submissionCount) * 10) / 10 : 0;

      setStats({
        totalActivities,
        totalClasses: 1,
        avgScore,
        totalSubmissions,
      });

      setActivityData(activityPerformance);
    } catch (err) {
      console.error('Failed to fetch teacher reports:', err);
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

  // Generate mock data for visualization
  const classPerformanceData = activityData.slice(0, 4).map((act, idx) => ({
    name: `Class ${String.fromCharCode(65 + idx)}`,
    avg: act.avg || 75,
    students: act.students || 50
  }));

  const scoringTrendData = [
    { week: 'Week 1', avg: 65, high: 92, low: 45 },
    { week: 'Week 2', avg: 68, high: 94, low: 48 },
    { week: 'Week 3', avg: 71, high: 96, low: 50 },
    { week: 'Week 4', avg: 74, high: 95, low: 52 },
    { week: 'Week 5', avg: stats?.avgScore || 76, high: 97, low: 54 },
  ];

  const criteriaDistribution = [
    { name: 'Communication', value: 125, percentage: 26 },
    { name: 'Leadership', value: 112, percentage: 23 },
    { name: 'Teamwork', value: 98, percentage: 20 },
    { name: 'Presentation', value: 89, percentage: 18 },
    { name: 'Others', value: 72, percentage: 13 },
  ];

  const COLORS = ['#FF00FF', '#00FFFF', '#FFEB3B', '#00FF00', '#FF6B6B'];

  if (!teacherData) return null;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader size={64} className="animate-spin text-black" strokeWidth={2} />
          <p className="text-2xl font-black uppercase">Loading Reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 lg:p-8">
        <div className="bg-[#FF6B6B] border-8 border-black p-8">
          <p className="text-2xl font-black uppercase text-white mb-4">❌ Error Loading Reports</p>
          <p className="text-white font-bold mb-4">{error}</p>
          <button
            onClick={fetchTeacherReports}
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
                <BarChart data={activityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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

            {/* Class Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                👥 CLASS PERFORMANCE
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
                  <Bar dataKey="avg" fill="#00FF00" stroke="#000" strokeWidth={2} name="Average %" />
                  <Bar dataKey="students" fill="#00FFFF" stroke="#000" strokeWidth={2} name="Total Students" />
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
                <LineChart data={scoringTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
                    data={criteriaDistribution}
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
                    {criteriaDistribution.map((entry, index) => (
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

              <div className="divide-y-2 divide-black">
                {activityPerformanceData.map((activity, idx) => (
                  <div key={idx} className="flex hover:bg-[#FFFACD] transition-all bg-white">
                    <div className="flex-1 min-w-40 p-4 border-r-2 border-gray-300 font-black text-base">{activity.name}</div>
                    <div className="w-24 min-w-24 p-4 border-r-2 border-gray-300 text-center">
                      <span className="bg-[#FF00FF] text-white px-2 py-1 font-black text-sm">{activity.avg}%</span>
                    </div>
                    <div className="w-28 min-w-28 p-4 border-r-2 border-gray-300 text-center font-bold">
                      <span className="bg-[#00FF00] text-black px-2 py-1 font-black text-sm">{activity.avg + 15}%</span>
                    </div>
                    <div className="w-28 min-w-28 p-4 border-r-2 border-gray-300 text-center font-bold">
                      <span className="bg-[#FF6B6B] text-white px-2 py-1 font-black text-sm">{activity.avg - 20}%</span>
                    </div>
                    <div className="w-32 min-w-32 p-4 text-center font-bold">{activity.submitted}/{activity.students}</div>
                  </div>
                ))}
              </div>
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
              <p className="text-5xl font-black">92%</p>
              <p className="text-sm font-bold mt-2">354 of 385 students</p>
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
              <p className="text-4xl font-black">+6.3%</p>
              <p className="text-sm font-bold mt-2">From Week 1 to Week 5</p>
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
              <p className="text-3xl font-black">Communication</p>
              <p className="text-sm font-bold mt-2">125 evaluations ⭐</p>
            </motion.div>
          </div>

        </main>
    </div>
  );
};

export default TeacherReports;
