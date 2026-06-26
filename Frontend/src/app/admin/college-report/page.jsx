"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import {
  TrendingUp, Users, Award, Activity, BarChart3, Loader, Filter, Scale
} from 'lucide-react';
import { getCollegeAnalytics, getClassPerformance, getDepartmentAnalytics, getPerformanceDistribution, getActivityAnalytics, getAnalyticsFilters } from '../../../api/adminApi';

const COLORS = ['#00FFFF', '#FF00FF', '#00FF00', '#FFEB3B', '#FF4500', '#1E90FF'];

const CollegeReport = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data States for Group A (Primary)
  const [collegeStats, setCollegeStats] = useState(null);
  const [classPerformance, setClassPerformance] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [performanceDistribution, setPerformanceDistribution] = useState([]);

  // Data States for Group B (Comparison)
  const [compareData, setCompareData] = useState(null);

  // Filter States
  const [filterOptions, setFilterOptions] = useState({ branches: [], semesters: [], sections: [] });
  const [filtersA, setFiltersA] = useState({ branch: '', semester: '', section: '' });
  const [filtersB, setFiltersB] = useState({ branch: '', semester: '', section: '' });
  const [isCompareMode, setIsCompareMode] = useState(false);

  useEffect(() => {
    fetchOptions();
    fetchAnalyticsData(filtersA, false);
  }, []);

  const fetchOptions = async () => {
    try {
      const opts = await getAnalyticsFilters();
      setFilterOptions(opts);
    } catch (err) {
      console.error("Failed to load filter options", err);
    }
  };

  const fetchAnalyticsData = async (filterObjA, fetchCompare = false, filterObjB = null) => {
    try {
      setLoading(true);
      setError(null);

      const fetchGroup = async (filters) => {
        // clean up empty filters
        const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
        const [stats, classPerf, depts, perfDist] = await Promise.all([
          getCollegeAnalytics(cleanFilters),
          getClassPerformance(cleanFilters),
          getDepartmentAnalytics(cleanFilters),
          getPerformanceDistribution(cleanFilters),
        ]);
        return { stats, classPerf, depts, perfDist };
      };

      const groupAData = await fetchGroup(filterObjA);
      setCollegeStats(groupAData.stats);
      setClassPerformance(groupAData.classPerf || []);
      setDepartmentData(groupAData.depts || []);
      setPerformanceDistribution(groupAData.perfDist || []);

      if (fetchCompare && filterObjB) {
        const groupBData = await fetchGroup(filterObjB);
        setCompareData(groupBData);
      } else {
        setCompareData(null);
      }

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchAnalyticsData(filtersA, isCompareMode, isCompareMode ? filtersB : null);
  };

  const overallStats = collegeStats ? [
    { label: 'Total Students', value: collegeStats.totalStudents?.toLocaleString() || '0', icon: Users, color: '#00FFFF' },
    { label: 'Avg Performance', value: `${collegeStats.avgPerformance?.toFixed(1) || 0}%`, icon: TrendingUp, color: '#00FF00' },
    { label: 'Total Activities', value: collegeStats.totalActivities?.toLocaleString() || '0', icon: Activity, color: '#FFEB3B' },
    { label: 'Submission Rate', value: `${collegeStats.submissionRate || 0}%`, icon: Award, color: '#FF00FF' },
  ] : [];

  const radarData = performanceDistribution.map((item, index) => {
    const dataObj = { subject: item.range, GroupA: item.count, fullMark: Math.max(...performanceDistribution.map(d => d.count), 10) };
    if (isCompareMode && compareData?.perfDist) {
       dataObj.GroupB = compareData.perfDist[index]?.count || 0;
       dataObj.fullMark = Math.max(dataObj.fullMark, ...compareData.perfDist.map(d => d.count));
    }
    return dataObj;
  });

  const comparisonClassData = classPerformance.slice(0, 6).map((item, idx) => {
    const dataObj = { name: item.name, GroupA_Avg: item.avgPercentage };
    if (isCompareMode && compareData?.classPerf) {
       dataObj.GroupB_Avg = compareData.classPerf[idx]?.avgPercentage || 0;
       // Try to match by name if possible, otherwise just use index
       const matchedB = compareData.classPerf.find(c => c.name === item.name);
       if (matchedB) dataObj.GroupB_Avg = matchedB.avgPercentage;
    }
    return dataObj;
  });


  if (loading && !collegeStats) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Loader size={64} className="animate-spin text-black" strokeWidth={2} />
          <p className="text-2xl font-black uppercase text-black">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  const FilterDropdown = ({ label, options, value, onChange, color }) => (
    <div className="flex flex-col gap-1 w-full md:w-auto">
      <label className="text-xs font-black uppercase tracking-wider">{label}</label>
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className={`p-2 border-4 border-black font-bold outline-none cursor-pointer`}
        style={{ backgroundColor: value ? color : '#fff', boxShadow: '4px 4px 0px #000' }}
      >
        <option value="">ALL</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 h-full w-full">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] border-8 border-black p-8 relative overflow-hidden"
            style={{ boxShadow: '16px 16px 0px rgba(0,0,0,0.4)' }}
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#FFEB3B] opacity-20 border-4 border-black rotate-45"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="bg-white p-4 border-4 border-black text-black transform rotate-3" style={{ boxShadow: '6px 6px 0px #000' }}>
                <BarChart3 size={48} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 leading-tight tracking-tighter text-white drop-shadow-lg">COLLEGE ANALYTICS</h2>
                <p className="text-sm font-black text-white uppercase tracking-widest bg-black inline-block px-3 py-1 border-2 border-white">Advanced Filter & Comparison Dashboard</p>
              </div>
            </div>
          </motion.div>

          {/* Neo-Brutalist Filter Panel */}
          <div className="mb-10 bg-white border-8 border-black p-6" style={{ boxShadow: '12px 12px 0px #000' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-black pb-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-black text-white p-3 border-4 border-black transform -rotate-3">
                  <Filter size={24} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Data Filters</h3>
              </div>
              
              <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`flex items-center gap-2 px-6 py-3 border-4 border-black font-black uppercase tracking-wider transition-all cursor-pointer ${isCompareMode ? 'bg-[#FFEB3B] translate-x-1 translate-y-1' : 'bg-white hover:-translate-y-1 hover:translate-x-1'}`}
                style={{ boxShadow: isCompareMode ? '0px 0px 0px #000' : '6px 6px 0px #000' }}
              >
                <Scale size={20} />
                Compare Mode {isCompareMode ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Group A Filters */}
              <div className={`flex-1 p-6 border-4 border-black ${isCompareMode ? 'bg-[#f0f8ff]' : 'bg-transparent'}`}>
                {isCompareMode && <h4 className="text-lg font-black uppercase mb-4 bg-black text-white inline-block px-3 py-1">GROUP A (Primary)</h4>}
                <div className="flex flex-wrap gap-6">
                  <FilterDropdown label="Department" options={filterOptions.branches} value={filtersA.branch} onChange={(v) => setFiltersA({...filtersA, branch: v})} color="#00FFFF" />
                  <FilterDropdown label="Semester" options={filterOptions.semesters} value={filtersA.semester} onChange={(v) => setFiltersA({...filtersA, semester: v})} color="#00FF00" />
                  <FilterDropdown label="Section" options={filterOptions.sections} value={filtersA.section} onChange={(v) => setFiltersA({...filtersA, section: v})} color="#FF00FF" />
                </div>
              </div>

              {/* Group B Filters (Comparison) */}
              <AnimatePresence>
                {isCompareMode && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0, scale: 0.9 }}
                    animate={{ opacity: 1, width: 'auto', scale: 1 }}
                    exit={{ opacity: 0, width: 0, scale: 0.9 }}
                    className="flex-1 p-6 border-4 border-black bg-[#fff0f5] overflow-hidden"
                  >
                    <h4 className="text-lg font-black uppercase mb-4 bg-black text-[#FF00FF] inline-block px-3 py-1">GROUP B (Compare)</h4>
                    <div className="flex flex-wrap gap-6 min-w-max">
                      <FilterDropdown label="Department" options={filterOptions.branches} value={filtersB.branch} onChange={(v) => setFiltersB({...filtersB, branch: v})} color="#00FFFF" />
                      <FilterDropdown label="Semester" options={filterOptions.semesters} value={filtersB.semester} onChange={(v) => setFiltersB({...filtersB, semester: v})} color="#00FF00" />
                      <FilterDropdown label="Section" options={filterOptions.sections} value={filtersB.section} onChange={(v) => setFiltersB({...filtersB, section: v})} color="#FF00FF" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleApplyFilters}
                disabled={loading}
                className="bg-[#00FF00] px-10 py-4 border-4 border-black font-black text-xl uppercase tracking-widest hover:-translate-y-2 transition-transform cursor-pointer flex items-center gap-3 disabled:opacity-50"
                style={{ boxShadow: '8px 8px 0px #000' }}
              >
                {loading ? <Loader className="animate-spin" /> : 'APPLY FILTERS & FETCH'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-[#FF6B6B] border-8 border-black p-6 mb-10 text-white font-black text-lg uppercase flex items-center gap-4">
              <span>⚠️</span> {error}
            </div>
          )}

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
                  className="bg-white border-6 border-black p-6 group hover:shadow-2xl transition-all relative overflow-hidden"
                  style={{ boxShadow: '8px 8px 0px #000' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-white p-3 border-4 border-black" style={{ backgroundColor: stat.color }}>
                      <Icon size={32} className="text-black" strokeWidth={2} />
                    </div>
                    {isCompareMode && compareData && (
                      <span className="text-xs font-black px-2 py-1 border-2 border-black bg-black text-[#FF00FF]">
                        Vs B
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-700 uppercase">{stat.label}</p>
                  
                  <div className="flex items-end gap-4 mt-2">
                    <p className="text-4xl font-black text-black">{stat.value}</p>
                    {isCompareMode && compareData && (
                      <div className="flex flex-col">
                        <p className="text-sm font-black text-gray-500 uppercase line-through">Group A</p>
                        <p className="text-xl font-black text-[#FF00FF]">{
                          idx === 0 ? compareData.stats.totalStudents :
                          idx === 1 ? `${compareData.stats.avgPerformance || 0}%` :
                          idx === 2 ? compareData.stats.totalActivities :
                          `${compareData.stats.submissionRate || 0}%`
                        }</p>
                      </div>
                    )}
                  </div>
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
                📊 PERFORMANCE COMPARISON
              </h3>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonClassData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                    <XAxis dataKey="name" stroke="#000" tick={{fontWeight: 'bold'}} />
                    <YAxis stroke="#000" tick={{fontWeight: 'bold'}} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFEB3B', border: '4px solid #000', borderRadius: 0, fontWeight: 'black', color: 'black' }}
                    />
                    <Legend wrapperStyle={{ fontWeight: 'black' }} />
                    <Bar dataKey="GroupA_Avg" fill="#00FFFF" stroke="#000" strokeWidth={3} name={isCompareMode ? "Group A Avg %" : "Average %"} />
                    {isCompareMode && (
                       <Bar dataKey="GroupB_Avg" fill="#FF00FF" stroke="#000" strokeWidth={3} name="Group B Avg %" />
                    )}
                  </BarChart>
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
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#000" />
                    <PolarAngleAxis dataKey="subject" stroke="#000" fontStyle={{ fontWeight: 'black' }} />
                    <PolarRadiusAxis stroke="#000" />
                    <Radar name={isCompareMode ? "Group A" : "Student Count"} dataKey="GroupA" stroke="#00FFFF" fill="#00FFFF" fillOpacity={0.6} strokeWidth={3} />
                    {isCompareMode && (
                      <Radar name="Group B" dataKey="GroupB" stroke="#FF00FF" fill="#FF00FF" fillOpacity={0.6} strokeWidth={3} />
                    )}
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '4px solid #000', borderRadius: 0, fontWeight: 'black', color: 'black' }} />
                    <Legend wrapperStyle={{ fontWeight: 'black' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

        </main>
    </div>
  );
};

export default CollegeReport;
