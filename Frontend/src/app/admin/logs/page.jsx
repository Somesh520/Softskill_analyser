"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Search, Activity, User, Calendar, Clock, Terminal } from 'lucide-react';
import { getLogs } from '../../../api/adminApi';

const AdminLogs = () => {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLogs();
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const actionMatch = (log.action || '').toLowerCase().includes(searchLower);
    const detailsMatch = (log.details || '').toLowerCase().includes(searchLower);
    const teacherMatch = (log.teacherId?.name || '').toLowerCase().includes(searchLower);
    return actionMatch || detailsMatch || teacherMatch;
  });

  const getActionColor = (action) => {
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (action.includes('CREATE') || action.includes('ADD')) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (action.includes('EDIT') || action.includes('UPDATE')) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if (action.includes('UPLOAD')) return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
    return 'bg-primary/10 text-primary border-primary/20';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center gap-2 font-semibold text-sm bg-card border border-border rounded-xl shadow-sm px-4 py-2 hover:bg-primary/5 transition-colors text-foreground mb-6"
            >
              <ArrowLeft size={18} /> Dashboard
            </button>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl text-primary border border-primary/20">
                <Terminal size={40} strokeWidth={2.5} />
              </div>
              <div>
                Activity Logs
              </div>
            </h1>
            <p className="font-medium mt-2 text-sm text-foreground/60 uppercase tracking-widest">
              Audit trail of teacher actions
            </p>
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="bg-primary text-primary-foreground border border-primary/50 rounded-xl shadow-md p-4 hover:opacity-90 transition-all disabled:opacity-50"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={24} strokeWidth={2.5} />
            </button>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/40">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Search by teacher, action, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl shadow-sm p-5 pl-16 text-lg font-medium text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </motion.div>

        {/* Stats Row */}
        {!loading && !error && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-4">
            <div className="bg-card border border-border rounded-xl shadow-sm px-5 py-3 font-semibold text-sm text-foreground/80 flex items-center gap-2">
              Showing: <span className="bg-primary/20 text-primary px-3 py-1 border border-primary/30 rounded-lg">{filteredLogs.length}</span> Logs
            </div>
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin mb-6" />
            <p className="text-xl font-bold text-foreground/80">Loading Logs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl shadow-sm p-12 text-center" >
            <h2 className="text-3xl font-bold text-red-500 mb-4">Error!</h2>
            <p className="text-lg font-medium mb-8 text-red-500/80">{error}</p>
            <button onClick={fetchLogs} className="bg-card border border-border rounded-xl shadow-sm px-8 py-3 font-bold hover:bg-primary/5 transition-all text-foreground">
              Try Again
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-16 text-center text-foreground" >
            <div className="bg-foreground/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Terminal size={48} strokeWidth={2} className="text-foreground/40" />
            </div>
            <h2 className="text-3xl font-bold mb-4">No Logs Found</h2>
            <p className="text-lg font-medium text-foreground/60">
              {searchTerm ? 'Try adjusting your search query.' : 'No teacher activities recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-12">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min((index % 15) * 0.05, 0.5) }}
                className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-shadow group"
              >
                {/* Action Badge */}
                <div className={`px-4 py-2 font-bold text-xs uppercase tracking-wider border rounded-xl shrink-0 md:w-48 text-center ${getActionColor(log.action)}`}>
                  {log.action.replace(/_/g, ' ')}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3 w-full">
                  <p className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{log.details}</p>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold text-foreground/60">
                    <span className="flex items-center gap-1.5 bg-background px-2.5 py-1.5 border border-border rounded-lg">
                      <User size={14} className="text-primary" />
                      {log.teacherId?.name || 'Unknown Teacher'}
                    </span>
                    <span className="flex items-center gap-1.5 bg-background px-2.5 py-1.5 border border-border rounded-lg">
                      <Calendar size={14} className="text-primary" />
                      {new Date(log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5 bg-background px-2.5 py-1.5 border border-border rounded-lg">
                      <Clock size={14} className="text-primary" />
                      {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
