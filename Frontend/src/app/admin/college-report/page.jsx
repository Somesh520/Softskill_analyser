"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import {
  TrendingUp, Users, Award, Activity, BarChart3, Loader, Filter, Scale
} from 'lucide-react';
import { getCollegeAnalytics, getClassPerformance, getDepartmentAnalytics, getPerformanceDistribution, getActivityAnalytics, getAnalyticsFilters } from '../../../api/adminApi';

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
    { label: 'Total Students', value: collegeStats.totalStudents?.toLocaleString() || '0', icon: Users, colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { label: 'Avg Performance', value: `${collegeStats.avgPerformance?.toFixed(1) || 0}%`, icon: TrendingUp, colorClass: 'text-green-500 bg-green-500/10 border-green-500/20' },
    { label: 'Total Activities', value: collegeStats.totalActivities?.toLocaleString() || '0', icon: Activity, colorClass: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Submission Rate', value: `${collegeStats.submissionRate || 0}%`, icon: Award, colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
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
          <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin" />
          <p className="text-xl font-bold text-foreground/80">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  const FilterDropdown = ({ label, options, value, onChange, colorClass }) => (
    <div className="flex flex-col gap-2 w-full md:w-auto flex-1 min-w-[150px]">
      <label className="text-xs font-semibold uppercase tracking-wider text-foreground/60">{label}</label>
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className={`p-3 border border-border rounded-xl shadow-sm font-medium outline-none cursor-pointer text-foreground bg-background focus:ring-2 focus:ring-primary/50 transition-all`}
      >
        <option value="">All</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-card border border-border rounded-2xl shadow-sm p-8 relative overflow-hidden"
          >
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl text-primary">
                <BarChart3 size={40} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">College Analytics</h2>
                <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">Advanced Filter & Comparison Dashboard</p>
              </div>
            </div>
          </motion.div>

          {/* Filter Panel */}
          <div className="mb-10 bg-card border border-border rounded-2xl shadow-sm p-6" >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/50 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-foreground/5 text-foreground p-3 border border-border rounded-xl">
                  <Filter size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">Data Filters</h3>
              </div>
              
              <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`flex items-center gap-2 px-5 py-2.5 border rounded-xl font-semibold text-sm transition-colors ${isCompareMode ? 'bg-primary text-primary-foreground border-primary/50' : 'bg-background border-border text-foreground hover:bg-foreground/5'}`}
              >
                <Scale size={18} />
                Compare Mode {isCompareMode ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Group A Filters */}
              <div className={`flex-1 p-6 border rounded-xl transition-colors ${isCompareMode ? 'bg-background border-border' : 'border-transparent p-0'}`}>
                {isCompareMode && <h4 className="text-sm font-semibold uppercase mb-4 text-primary bg-primary/10 inline-block px-2 py-1 rounded-md">Group A (Primary)</h4>}
                <div className="flex flex-wrap gap-4">
                  <FilterDropdown label="Department" options={filterOptions.branches} value={filtersA.branch} onChange={(v) => setFiltersA({...filtersA, branch: v})} />
                  <FilterDropdown label="Semester" options={filterOptions.semesters} value={filtersA.semester} onChange={(v) => setFiltersA({...filtersA, semester: v})} />
                  <FilterDropdown label="Section" options={filterOptions.sections} value={filtersA.section} onChange={(v) => setFiltersA({...filtersA, section: v})} />
                </div>
              </div>

              {/* Group B Filters (Comparison) */}
              <AnimatePresence>
                {isCompareMode && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0, scale: 0.95 }}
                    animate={{ opacity: 1, width: 'auto', scale: 1 }}
                    exit={{ opacity: 0, width: 0, scale: 0.95 }}
                    className="flex-1 p-6 border border-border rounded-xl bg-foreground/5 overflow-hidden"
                  >
                    <h4 className="text-sm font-semibold uppercase mb-4 text-foreground/70 bg-background border border-border inline-block px-2 py-1 rounded-md">Group B (Compare)</h4>
                    <div className="flex flex-wrap gap-4 min-w-max">
                      <FilterDropdown label="Department" options={filterOptions.branches} value={filtersB.branch} onChange={(v) => setFiltersB({...filtersB, branch: v})} />
                      <FilterDropdown label="Semester" options={filterOptions.semesters} value={filtersB.semester} onChange={(v) => setFiltersB({...filtersB, semester: v})} />
                      <FilterDropdown label="Section" options={filterOptions.sections} value={filtersB.section} onChange={(v) => setFiltersB({...filtersB, section: v})} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 flex justify-end pt-6 border-t border-border/50">
              <button 
                onClick={handleApplyFilters}
                disabled={loading}
                className="bg-primary text-primary-foreground px-8 py-3.5 border border-primary/50 rounded-xl shadow-md font-bold text-sm tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin" size={18}/> : <Filter size={18}/>}
                APPLY FILTERS & FETCH
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-6 mb-10 font-semibold flex items-center gap-3">
              <span className="bg-red-500/20 p-1.5 rounded-md">⚠️</span> {error}
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
                  className="bg-card border border-border rounded-2xl shadow-sm p-6 group hover:border-primary/50 transition-colors relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 border rounded-xl ${stat.colorClass}`}>
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    {isCompareMode && compareData && (
                      <span className="text-xs font-semibold px-2 py-1 border border-border rounded-md bg-foreground/5 text-foreground/70">
                        Vs B
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground/60 mb-1">{stat.label}</p>
                  
                  <div className="flex items-end gap-4 mt-2">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    {isCompareMode && compareData && (
                      <div className="flex flex-col items-end">
                        <p className="text-xs font-semibold text-foreground/40 line-through">Group A</p>
                        <p className="text-lg font-bold text-foreground/70">{
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
              className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-8"
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                Performance Comparison
              </h3>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonClassData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--foreground)" tick={{fill: 'var(--foreground)', opacity: 0.7}} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--foreground)" tick={{fill: 'var(--foreground)', opacity: 0.7}} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="GroupA_Avg" fill="var(--primary)" radius={[4, 4, 0, 0]} name={isCompareMode ? "Group A Avg %" : "Average %"} />
                    {isCompareMode && (
                       <Bar dataKey="GroupB_Avg" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Group B Avg %" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Section-wise Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl shadow-sm p-8"
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                Score Distribution
              </h3>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--foreground)', fontSize: 12, opacity: 0.8}} />
                    <PolarRadiusAxis stroke="transparent" />
                    <Radar name={isCompareMode ? "Group A" : "Student Count"} dataKey="GroupA" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} strokeWidth={2} />
                    {isCompareMode && (
                      <Radar name="Group B" dataKey="GroupB" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.5} strokeWidth={2} />
                    )}
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
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
