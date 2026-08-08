"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, Bot, Loader, BrainCircuit } from 'lucide-react';
import { getLeaderboard, getLeaderboardInsights } from '../../../api/leaderboardApi';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [aiInsight, setAiInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCalled = React.useRef(false);

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchData();
      fetchCalled.current = true;
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard(20);
      setLeaderboard(data);
      
      // Fetch AI Insights in parallel but don't block the UI
      fetchInsights();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setInsightLoading(true);
      const insightData = await getLeaderboardInsights();
      setAiInsight(insightData);
    } catch (error) {
      setAiInsight("AI Insights are currently unavailable.");
    } finally {
      setInsightLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-background p-6">
        <Loader size={48} className="animate-spin text-primary mb-4" />
        <p className="text-xl font-bold text-foreground">Loading Rankings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-card border border-border rounded-2xl shadow-sm p-8 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
            <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl text-primary flex items-center justify-center shrink-0">
              <Trophy size={48} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">College Leaderboard</h2>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">
                Top 20 Soft-Skill Performers
              </p>
            </div>
          </div>
        </motion.div>

        {error && (
            <div className="mb-8 bg-red-500/10 text-red-500 p-4 border border-red-500/20 rounded-xl shadow-sm font-semibold flex items-center gap-3">
             <Trophy size={20} /> {error}
           </div>
        )}

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Leaderboard */}
          <div className="flex-1 order-2 xl:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl shadow-sm p-6 lg:p-8"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-foreground border-b border-border/50 pb-4">
                <Medal size={24} className="text-primary" /> Current Rankings
              </h3>
              
              <div className="flex flex-col gap-3">
                {leaderboard.length === 0 ? (
                    <div className="text-center py-12 border border-border border-dashed rounded-xl bg-background">
                        <Trophy size={48} className="mx-auto text-foreground/20 mb-4" />
                        <p className="font-semibold text-foreground/50 text-lg">No rankings available yet.</p>
                    </div>
                ) : (
                    leaderboard.map((student, index) => {
                    const isTop3 = index < 3;
                    const isGold = index === 0;
                    const isSilver = index === 1;
                    const isBronze = index === 2;
                    
                    let rowBg = "bg-background";
                    let rankStyle = "bg-foreground/5 text-foreground/70 border-transparent";
                    let nameColor = "text-foreground";
                    
                    if (isGold) { 
                        rowBg = "bg-yellow-500/5 border-yellow-500/20"; 
                        rankStyle = "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"; 
                        nameColor = "text-yellow-600";
                    } else if (isSilver) { 
                        rowBg = "bg-gray-500/5 border-gray-500/20"; 
                        rankStyle = "bg-gray-500/20 text-gray-500 border-gray-500/30"; 
                    } else if (isBronze) { 
                        rowBg = "bg-amber-700/5 border-amber-700/20"; 
                        rankStyle = "bg-amber-700/20 text-amber-700 border-amber-700/30"; 
                    }

                    return (
                        <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index * 0.05, 0.5) }}
                        key={student._id} 
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${rowBg}`}
                        >
                        <div className="flex items-center gap-5 mb-4 sm:mb-0">
                            <div className={`w-12 h-12 flex items-center justify-center font-bold text-xl border rounded-xl shrink-0 ${isGold ? 'scale-110 shadow-sm' : ''} ${rankStyle}`} >
                                #{index + 1}
                            </div>
                            <div>
                            <h4 className={`text-lg font-bold flex items-center gap-2 ${isGold ? nameColor : 'text-foreground'}`}>
                                {student.name}
                                {isGold && <Award size={18} className="text-yellow-500 fill-yellow-500" />}
                            </h4>
                            <p className="text-xs font-semibold text-foreground/50">{student.rollNo}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6 pl-17 sm:pl-0">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-semibold text-foreground/50 tracking-wider">Activities</p>
                                <p className="text-base font-bold text-foreground">{student.totalActivities}</p>
                            </div>
                            <div className="text-right flex-1 sm:flex-none flex items-center sm:block justify-between">
                                <p className="text-xs font-semibold text-foreground/50 tracking-wider sm:hidden">Score</p>
                                <p className="text-xs font-semibold text-foreground/50 tracking-wider hidden sm:block">Avg Score</p>
                                <div className={`text-xl font-bold px-3 py-1 rounded-lg inline-block ${isTop3 ? 'bg-primary/10 text-primary border border-primary/20' : 'text-foreground bg-foreground/5'}`} >
                                    {student.avgScore}%
                                </div>
                            </div>
                        </div>
                        </motion.div>
                    );
                    })
                )}
              </div>
            </motion.div>
          </div>

          {/* AI Insights Sidebar */}
          <div className="w-full xl:w-80 2xl:w-96 order-1 xl:order-2 shrink-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl shadow-sm p-6 sticky top-6"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <BrainCircuit size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    AI Insight
                  </h3>
              </div>
              
              {insightLoading ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary font-semibold text-sm">
                        <Loader size={16} className="animate-spin" /> Analyzing performance...
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-foreground/5 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-foreground/5 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-foreground/5 rounded w-4/5 animate-pulse"></div>
                    </div>
                </div>
              ) : (
                <div className="space-y-4">
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                        {aiInsight || "No insights available at this time."}
                    </p>
                    <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground/50 flex items-center gap-1"><Star size={12}/> Powered by Groq</span>
                    </div>
                </div>
              )}
            </motion.div>

            {/* Quick Stats Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-primary/5 border border-primary/20 rounded-2xl shadow-sm p-6 mt-6"
            >
               <h4 className="font-bold text-primary mb-4 flex items-center gap-2"><Trophy size={18}/> Quick Stats</h4>
               <div className="space-y-3">
                   <div className="flex justify-between items-center bg-background border border-border rounded-lg p-3">
                       <span className="text-xs font-semibold text-foreground/70">Top Score</span>
                       <span className="font-bold text-foreground">{leaderboard[0]?.avgScore || 0}%</span>
                   </div>
                   <div className="flex justify-between items-center bg-background border border-border rounded-lg p-3">
                       <span className="text-xs font-semibold text-foreground/70">Total Ranked</span>
                       <span className="font-bold text-foreground">{leaderboard.length}</span>
                   </div>
               </div>
            </motion.div>
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default LeaderboardPage;
