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

  useEffect(() => {
    fetchData();
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
      <div className="flex-1 flex items-center justify-center p-6 min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin" />
          <p className="text-xl font-bold text-foreground/80">Loading Rankings...</p>
        </div>
      </div>
    );
  }

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
              <Trophy size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">College Leaderboard</h2>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">Top 20 Soft-Skill Performers</p>
            </div>
          </div>
        </motion.div>

        {/* AI Insight Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 bg-primary/5 border border-primary/20 rounded-2xl shadow-sm p-8 relative flex items-start gap-6"
        >
          <div className="bg-primary/20 text-primary p-4 rounded-xl border border-primary/30 shrink-0" >
            <BrainCircuit size={28} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-2 text-primary flex items-center gap-2">
              <Bot size={16} /> AI Insight
            </h3>
            {insightLoading ? (
              <div className="flex items-center gap-3 text-foreground/50 font-medium text-sm animate-pulse">
                <Loader size={16} className="animate-spin" /> Generating AI Analysis...
              </div>
            ) : (
              <p className="text-base font-medium text-foreground/80 leading-relaxed italic border-l-2 border-primary/50 pl-4">
                "{aiInsight}"
              </p>
            )}
          </div>
        </motion.div>

        {/* Leaderboard List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl shadow-sm p-8"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground border-b border-border/50 pb-4">
            <Medal size={24} className="text-primary" /> Current Rankings
          </h3>
          
          <div className="flex flex-col gap-4">
            {leaderboard.map((student, index) => {
              const isGold = index === 0;
              const isSilver = index === 1;
              const isBronze = index === 2;
              
              let rowStyle = "bg-background border-border text-foreground hover:border-primary/50";
              let rankStyle = "bg-card border-border text-foreground";
              
              if (isGold) { 
                rowStyle = "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"; 
                rankStyle = "bg-amber-500 text-white border-amber-600"; 
              }
              else if (isSilver) { 
                rowStyle = "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-300"; 
                rankStyle = "bg-slate-400 text-white border-slate-500"; 
              }
              else if (isBronze) { 
                rowStyle = "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400"; 
                rankStyle = "bg-orange-500 text-white border-orange-600"; 
              }

              return (
                <div 
                  key={student._id} 
                  className={`flex items-center justify-between p-5 border rounded-xl transition-all ${rowStyle}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 flex items-center justify-center font-bold text-lg border rounded-xl shadow-sm ${rankStyle}`} >
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold flex items-center gap-2 ${isGold ? '' : 'text-foreground'}`}>
                        {student.name}
                        {isGold && <Award size={18} className="text-amber-500 fill-current" />}
                      </h4>
                      <p className="text-xs font-semibold uppercase opacity-70">{student.rollNo}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-semibold uppercase opacity-60 tracking-wider">Activities</p>
                      <p className={`text-base font-bold ${isGold ? '' : 'text-foreground'}`}>{student.totalActivities}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase opacity-60 tracking-wider">Average</p>
                      <p className={`text-xl font-bold px-3 py-1 rounded-lg ${isGold ? 'bg-amber-500/20' : 'bg-primary/10 text-primary'}`} >
                        {student.avgScore}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
        
      </main>
    </div>
  );
};

export default LeaderboardPage;
