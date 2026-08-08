"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Eye,
  Table,
  Trash2,
  ArrowRight,
  Home
} from 'lucide-react';
import { getActivities, downloadActivityTemplate, uploadActivityMarks } from '../../../api/teacherApi';
import { useAuth } from '../../../context/AuthContext';

const UploadMarks = () => {
  const router = useRouter();
  const { user: teacherData } = useAuth();
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (teacherData) {
      fetchActivities();
    }
  }, [teacherData]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await getActivities();
      setActivities(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySelect = (activityId) => {
    setSelectedActivity(activityId);
    setCsvFile(null);
    setCsvData(null);
    setPreviewMode(false);
  };

  const handleDownloadTemplate = async () => {
    if (!selectedActivity) {
      setError('Select an activity first');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    try {
      const activity = activities.find(a => a._id === selectedActivity);
      const blob = await downloadActivityTemplate(selectedActivity);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${activity.title.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setError(err.message);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return null;

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      if (Object.values(row).some(v => v)) {
        data.push(row);
      }
    }

    return { headers, rows: data };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const parsed = parseCSV(content);

        if (!parsed || parsed.rows.length === 0) {
          setError('CSV file is empty or invalid');
          setStatus('error');
          setTimeout(() => setStatus('idle'), 3000);
          return;
        }

        setCsvFile(file);
        setCsvData(parsed);
        setPreviewMode(true);
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2000);
      } catch (err) {
        setError('Failed to parse CSV file');
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleClearFile = () => {
    setCsvFile(null);
    setCsvData(null);
    setPreviewMode(false);
  };

  const handleSubmitMarks = async () => {
    if (!selectedActivity || !csvFile) {
      setError('Select activity and file first');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    try {
      setUploading(true);
      await uploadActivityMarks(selectedActivity, csvFile);
      setStatus('success');
      setCsvFile(null);
      setCsvData(null);
      setPreviewMode(false);
      setTimeout(() => {
        setStatus('idle');
        router.push('/teacher/create-activity');
      }, 2000);
    } catch (err) {
      setError(err.message);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setUploading(false);
    }
  };

  if (!teacherData) return null;

  const selectedActivityData = activities.find(a => a._id === selectedActivity);

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 bg-card border border-border rounded-2xl shadow-sm p-8 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl text-primary" >
              <FileSpreadsheet size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">Upload Marks</h2>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">
                Bulk Import Student Marks via CSV
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Step 1: Select Activity */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3 mb-6">
                <span className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm">1</span> Select Activity
                </h3>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex flex-col items-center py-12" >
                    <div className="w-10 h-10 border-4 border-border rounded-full border-t-primary animate-spin mb-4" />
                    <p className="font-semibold text-foreground/70">Loading Activities...</p>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-10 bg-background border border-border rounded-xl border-dashed">
                    <p className="font-semibold text-foreground/50">No activities available</p>
                    </div>
                ) : (
                    activities.map((activity, idx) => (
                    <motion.button
                        key={activity._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                        onClick={() => handleActivitySelect(activity._id)}
                        className={`w-full p-4 border rounded-xl text-left transition-all cursor-pointer ${
                        selectedActivity === activity._id
                            ? 'bg-primary/5 border-primary shadow-sm'
                            : 'bg-background border-border hover:border-primary/50'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-foreground leading-tight">{activity.title}</h4>
                            <p className="text-sm font-medium text-foreground/60 mt-1 line-clamp-1">{activity.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                            <span className="bg-foreground/5 text-foreground/80 px-2.5 py-1 text-xs font-semibold rounded-md">
                                📅 {new Date(activity.dueDate).toLocaleDateString()}
                            </span>
                            <span className="bg-primary/10 text-primary px-2.5 py-1 text-xs font-semibold rounded-md">
                                ⭐ {activity.maxPoints} pts
                            </span>
                            </div>
                        </div>
                        {selectedActivity === activity._id && (
                            <CheckCircle2 size={24} className="text-primary shrink-0 mt-1" />
                        )}
                        </div>
                    </motion.button>
                    ))
                )}
                </div>

                {selectedActivity && (
                <button
                    onClick={handleDownloadTemplate}
                    className="w-full mt-6 bg-background border border-border rounded-xl p-4 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-foreground/5 transition-colors cursor-pointer text-foreground"
                >
                    <Download size={20} /> Download Template
                </button>
                )}
            </div>
          </div>

          {/* Step 2: Upload File */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col">
                <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3 mb-6">
                <span className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm">2</span> Upload CSV
                </h3>

                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-full">
                        <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        disabled={!selectedActivity}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                            selectedActivity 
                            ? 'border-primary/50 hover:bg-primary/5 cursor-pointer bg-background' 
                            : 'border-border opacity-50 bg-background'
                        }`}>
                        <Upload className={`mx-auto mb-4 ${selectedActivity ? 'text-primary' : 'text-foreground/40'}`} size={40} strokeWidth={2} />
                        <p className="font-bold text-lg text-foreground mb-1">Drop CSV File Here</p>
                        <p className="text-sm font-medium text-foreground/60">or click to browse</p>
                        </div>
                    </div>

                    {!selectedActivity && (
                        <p className="text-sm font-semibold text-red-500 bg-red-500/10 p-3 rounded-lg w-full text-center">
                        Select an activity first
                        </p>
                    )}

                    {csvFile && (
                        <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-primary/10 border border-primary/20 rounded-xl p-4 text-center"
                        >
                        <p className="font-bold text-primary flex items-center justify-center gap-2 mb-1">
                            <CheckCircle2 size={20} /> {csvFile.name}
                        </p>
                        <p className="text-sm font-medium text-foreground/70">
                            {csvData?.rows.length} records ready to upload
                        </p>
                        </motion.div>
                    )}

                    {csvFile && (
                        <div className="w-full space-y-3 mt-auto pt-6">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className="w-full bg-background border border-border rounded-xl p-4 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-foreground/5 transition-colors cursor-pointer text-foreground"
                        >
                            <Eye size={20} /> {previewMode ? 'Hide Preview' : 'Preview Data'}
                        </button>
                        <button
                            onClick={handleClearFile}
                            className="w-full bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-4 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                            <Trash2 size={20} /> Clear File
                        </button>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Step 3: Review & Submit */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col">
                <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3 mb-6">
                <span className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm">3</span> Review & Submit
                </h3>

                <div className="space-y-6 flex-1">
                {selectedActivityData ? (
                    <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-background border border-border rounded-xl p-5"
                    >
                    <h4 className="font-semibold text-sm text-foreground/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                        Activity Details
                    </h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-foreground/60 font-medium">Title</span>
                            <span className="font-semibold text-foreground text-right">{selectedActivityData.title}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-foreground/60 font-medium">Max Points</span>
                            <span className="font-semibold text-foreground">{selectedActivityData.maxPoints}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-foreground/60 font-medium">Due Date</span>
                            <span className="font-semibold text-foreground">{new Date(selectedActivityData.dueDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    </motion.div>
                ) : (
                    <div className="bg-background border border-border border-dashed rounded-xl p-5 text-center text-foreground/50 text-sm font-medium">
                        Waiting for activity selection...
                    </div>
                )}

                {csvData && (
                    <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/20 rounded-xl p-5"
                    >
                    <h4 className="font-semibold text-sm text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                        Data Summary
                    </h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-foreground/70 font-medium">Records</span>
                            <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{csvData.rows.length}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-foreground/70 font-medium">Columns Detected</span>
                            <span className="font-semibold text-foreground">{csvData.headers.length}</span>
                        </div>
                    </div>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-500"
                    >
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                )}

                <div className="mt-auto pt-6 space-y-3">
                    <button
                        onClick={handleSubmitMarks}
                        disabled={!selectedActivity || !csvFile || uploading}
                        className={`w-full text-white font-bold text-lg rounded-xl shadow-md py-4 flex justify-center items-center gap-2 transition-all ${
                            !selectedActivity || !csvFile || uploading ? 'bg-foreground/20 cursor-not-allowed' : 'bg-primary hover:opacity-90 cursor-pointer'
                        }`}
                    >
                        {uploading ? (
                        <>
                            <Loader2 className="animate-spin" size={24} /> Uploading...
                        </>
                        ) : (
                        <>
                            Submit Marks <ArrowRight size={20} />
                        </>
                        )}
                    </button>
                </div>
                </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {previewMode && csvData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setPreviewMode(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-card border border-border rounded-2xl shadow-xl max-w-6xl w-full max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-border">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <Table size={24} className="text-primary" /> Data Preview
                  </h3>
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="text-foreground/50 hover:text-foreground hover:bg-foreground/5 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 overflow-x-auto flex-1 bg-background rounded-b-2xl">
                  <div className="border border-border rounded-xl bg-card overflow-hidden w-fit min-w-full">
                    <div className="bg-foreground/5 border-b border-border flex font-semibold text-xs uppercase tracking-wider text-foreground/70">
                      {csvData.headers.map((header) => (
                        <div
                          key={header}
                          className="flex-1 min-w-[150px] p-4 border-r border-border/50 last:border-r-0"
                        >
                          {header}
                        </div>
                      ))}
                    </div>

                    <div className="divide-y divide-border/50">
                      {csvData.rows.map((row, idx) => (
                        <div key={idx} className="flex hover:bg-foreground/5 transition-colors">
                          {csvData.headers.map((header) => (
                            <div
                              key={header}
                              className="flex-1 min-w-[150px] p-4 border-r border-border/50 last:border-r-0 font-medium text-sm text-foreground"
                            >
                              {row[header] || '-'}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Notification */}
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-8 right-8 z-[100]"
            >
              <div
                className={`${
                  status === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                } border rounded-xl shadow-lg p-5 flex items-center gap-4`}
              >
                {status === 'success' ? (
                  <CheckCircle2 size={32} />
                ) : (
                  <AlertCircle size={32} />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {status === 'success' ? 'Success!' : 'Error'}
                  </h4>
                  <p className="text-xs font-medium opacity-90">
                    {status === 'success'
                      ? 'File processed successfully'
                      : error || 'Something went wrong'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default UploadMarks;
