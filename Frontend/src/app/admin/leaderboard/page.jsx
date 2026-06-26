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
          <Loader size={64} className="animate-spin text-black" strokeWidth={2} />
          <p className="text-2xl font-black uppercase text-black">Loading Rankings...</p>
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
          className="mb-8 bg-[#FFD700] border-8 border-black p-8 relative overflow-hidden"
          style={{ boxShadow: '16px 16px 0px rgba(0,0,0,0.4)' }}
        >
          <div className="flex items-center gap-8 relative z-10">
            <div className="bg-white p-4 border-4 border-black text-black transform -rotate-6" style={{ boxShadow: '6px 6px 0px #000' }}>
              <Trophy size={48} strokeWidth={2} className="text-[#FFD700]" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 leading-tight tracking-tighter text-black drop-shadow-lg">COLLEGE LEADERBOARD</h2>
              <p className="text-sm font-black text-white uppercase tracking-widest bg-black inline-block px-3 py-1 border-2 border-white">Top 20 Soft-Skill Performers</p>
            </div>
          </div>
        </motion.div>

        {/* AI Insight Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 bg-white border-8 border-black p-6 relative"
          style={{ boxShadow: '12px 12px 0px #000' }}
        >
          <div className="absolute -top-6 -left-6 bg-black text-[#00FFFF] p-3 border-4 border-[#00FFFF] flex items-center justify-center" style={{ boxShadow: '4px 4px 0px #000' }}>
            <BrainCircuit size={32} />
          </div>
          <div className="ml-8">
            <h3 className="text-xl font-black uppercase tracking-widest mb-3 text-[#FF00FF] flex items-center gap-2">
              <Bot size={20} /> Groq AI Insight
            </h3>
            {insightLoading ? (
              <div className="flex items-center gap-3 text-gray-500 font-bold uppercase animate-pulse">
                <Loader size={20} className="animate-spin" /> Generating AI Analysis...
              </div>
            ) : (
              <p className="text-lg font-bold text-black leading-relaxed italic border-l-8 border-[#00FFFF] pl-4">
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
          className="bg-white border-8 border-black p-8"
          style={{ boxShadow: '12px 12px 0px #000' }}
        >
          <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-black border-b-4 border-black pb-4">
            <Medal size={28} /> CURRENT RANKINGS
          </h3>
          
          <div className="flex flex-col gap-4">
            {leaderboard.map((student, index) => {
              const isGold = index === 0;
              const isSilver = index === 1;
              const isBronze = index === 2;
              
              let rowBg = "bg-[#f8f8f8]";
              let rankColor = "bg-black text-white";
              
              if (isGold) { rowBg = "bg-[#FFFACD]"; rankColor = "bg-[#FFD700] text-black"; }
              else if (isSilver) { rowBg = "bg-[#F0F0F0]"; rankColor = "bg-[#C0C0C0] text-black"; }
              else if (isBronze) { rowBg = "bg-[#FFF0F5]"; rankColor = "bg-[#CD7F32] text-white"; }

              return (
                <div 
                  key={student._id} 
                  className={`flex items-center justify-between p-4 border-4 border-black transition-transform hover:-translate-y-1 ${rowBg}`}
                  style={{ boxShadow: '4px 4px 0px #000' }}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 flex items-center justify-center font-black text-xl border-4 border-black transform ${isGold ? 'scale-110 -rotate-6' : ''} ${rankColor}`} style={{ boxShadow: '2px 2px 0px #000' }}>
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase text-black flex items-center gap-2">
                        {student.name}
                        {isGold && <Award size={20} className="text-[#FFD700] fill-current" />}
                      </h4>
                      <p className="text-sm font-bold text-gray-600 uppercase">{student.rollNo}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-black uppercase text-gray-500 tracking-wider">Activities</p>
                      <p className="text-lg font-black">{student.totalActivities}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase text-gray-500 tracking-wider">Average</p>
                      <p className={`text-2xl font-black px-3 py-1 border-4 border-black inline-block ${isGold ? 'bg-[#00FFFF] text-black' : 'bg-black text-white'}`} style={{ boxShadow: '3px 3px 0px #000' }}>
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
