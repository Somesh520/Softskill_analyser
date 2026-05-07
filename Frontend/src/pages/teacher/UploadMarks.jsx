import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Sidebar, { SidebarProvider } from '../../components/layout/Sidebar';
import { getActivities, downloadActivityTemplate, uploadActivityMarks } from '../../api/teacherApi';

const UploadMarks = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(null);
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
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userString) navigate('/login');
    const user = JSON.parse(userString);
    setTeacherData(user);
    fetchActivities();
  }, [navigate]);

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
        navigate('/teacher/create-activity');
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
        <div className="flex flex-col flex-1 h-full w-full">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] border-8 border-black p-8 relative overflow-hidden"
            style={{ boxShadow: '16px 16px 0px rgba(0,0,0,0.4)' }}
          >
            <div className="absolute -left-8 -top-8 w-40 h-40 bg-[#FFEB3B] opacity-20 border-4 border-black rotate-45"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="bg-white p-4 border-4 border-black text-black transform rotate-3" style={{ boxShadow: '6px 6px 0px #000' }}>
                <FileSpreadsheet size={48} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 leading-tight tracking-tighter text-white drop-shadow-lg">UPLOAD MARKS</h2>
                <p className="text-sm font-black text-white uppercase tracking-widest bg-black inline-block px-3 py-1 border-2 border-white">Bulk Import Student Marks via CSV</p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Step 1: Select Activity */}
            <div className="w-full lg:w-1/3 space-y-6">
              <h3 className="text-3xl font-black uppercase flex items-center gap-3 mb-6 bg-[#00FFFF] border-6 border-black p-4 inline-block" style={{ boxShadow: '6px 6px 0px #000' }}>
                <span className="bg-black text-white w-10 h-10 flex items-center justify-center rounded-sm font-black">1</span> SELECT ACTIVITY
              </h3>

              <div className="space-y-3">
                {loading ? (
                  <div className="flex flex-col items-center py-12 bg-white border-6 border-black" style={{ boxShadow: '8px 8px 0px #000' }}>
                    <Loader2 className="animate-spin mb-4 text-[#FF00FF]" size={48} />
                    <p className="font-black uppercase">Loading...</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="bg-white border-6 border-black p-8 text-center" style={{ boxShadow: '8px 8px 0px #000' }}>
                    <p className="font-bold text-gray-600 uppercase">📭 No activities available</p>
                  </div>
                ) : (
                  activities.map((activity, idx) => (
                    <motion.button
                      key={activity._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleActivitySelect(activity._id)}
                      className={`w-full p-6 border-6 text-left transition-all ${
                        selectedActivity === activity._id
                          ? 'bg-[#00FF00] border-black'
                          : 'bg-white border-black hover:bg-[#FFFACD]'
                      }`}
                      style={{ 
                        boxShadow: selectedActivity === activity._id ? '8px 8px 0px #000' : '4px 4px 0px #000'
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-black uppercase text-black">{activity.title}</h4>
                          <p className="text-sm font-bold text-gray-700 mt-1">{activity.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="bg-black text-white px-2 py-1 text-xs font-black">
                              📅 {new Date(activity.dueDate).toLocaleDateString()}
                            </span>
                            <span className="bg-[#FFEB3B] border-2 border-black px-2 py-1 text-xs font-black">
                              ⭐ {activity.maxPoints} pts
                            </span>
                          </div>
                        </div>
                        {selectedActivity === activity._id && (
                          <CheckCircle2 size={32} className="text-[#00FF00] shrink-0 mt-1" strokeWidth={3} />
                        )}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              {selectedActivity && (
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full bg-[#FFEB3B] border-6 border-black p-4 font-black uppercase text-lg flex items-center justify-center gap-3 hover:bg-[#FF00FF] active:scale-95 transition-all"
                  style={{ boxShadow: '6px 6px 0px #000' }}
                >
                  <Download size={24} /> DOWNLOAD TEMPLATE
                </button>
              )}
            </div>

            {/* Step 2: Upload File */}
            <div className="w-full lg:w-1/3 space-y-6">
              <h3 className="text-3xl font-black uppercase flex items-center gap-3 mb-6 bg-[#FF00FF] border-6 border-black p-4 inline-block text-white" style={{ boxShadow: '6px 6px 0px #000' }}>
                <span className="bg-white text-[#FF00FF] w-10 h-10 flex items-center justify-center rounded-sm font-black">2</span> UPLOAD CSV
              </h3>

              <div className="bg-white border-6 border-black p-8 text-center space-y-6" style={{ boxShadow: '8px 8px 0px #000' }}>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={!selectedActivity}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className={`border-6 border-dashed ${selectedActivity ? 'border-black' : 'border-gray-400'} p-12 transition-all ${selectedActivity ? 'hover:bg-[#FFFACD] cursor-pointer' : 'opacity-50'}`}>
                    <Upload className={`mx-auto mb-4 ${selectedActivity ? 'text-black' : 'text-gray-400'}`} size={56} />
                    <p className="font-black uppercase text-lg text-black mb-2">📁 Drop CSV File Here</p>
                    <p className={`text-sm font-bold ${selectedActivity ? 'text-gray-700' : 'text-gray-500'}`}>or click to select</p>
                  </div>
                </div>

                {!selectedActivity && (
                  <p className="text-sm font-black text-red-600 bg-red-100 p-3 border-2 border-red-600 uppercase">
                    ⚠️ Select an activity first
                  </p>
                )}

                {csvFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#00FF00] border-4 border-black p-4"
                  >
                    <p className="font-black text-lg flex items-center gap-2 justify-center">
                      <CheckCircle2 size={24} /> {csvFile.name}
                    </p>
                    <p className="text-sm font-bold text-gray-700 mt-2">
                      {csvData?.rows.length} records ready to upload
                    </p>
                  </motion.div>
                )}
              </div>

              {csvFile && (
                <div className="space-y-3">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="w-full bg-[#00FFFF] border-6 border-black p-4 font-black uppercase text-lg flex items-center justify-center gap-3 hover:bg-[#FFEB3B] active:scale-95 transition-all"
                    style={{ boxShadow: '6px 6px 0px #000' }}
                  >
                    <Eye size={24} /> {previewMode ? 'HIDE' : 'PREVIEW'} DATA
                  </button>
                  <button
                    onClick={handleClearFile}
                    className="w-full bg-white border-6 border-black p-4 font-black uppercase text-lg flex items-center justify-center gap-3 hover:bg-red-100 active:scale-95 transition-all"
                    style={{ boxShadow: '6px 6px 0px #000' }}
                  >
                    <Trash2 size={24} /> CLEAR FILE
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Review & Submit */}
            <div className="w-full lg:w-1/3 space-y-6">
              <h3 className="text-3xl font-black uppercase flex items-center gap-3 mb-6 bg-[#FFEB3B] border-6 border-black p-4 inline-block" style={{ boxShadow: '6px 6px 0px #000' }}>
                <span className="bg-black text-white w-10 h-10 flex items-center justify-center rounded-sm font-black">3</span> REVIEW & SUBMIT
              </h3>

              <div className="space-y-4">
                {selectedActivityData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#00FFFF] to-[#00FF00] border-6 border-black p-6"
                    style={{ boxShadow: '8px 8px 0px #000' }}
                  >
                    <h4 className="font-black text-lg uppercase mb-3 flex items-center gap-2">
                      📋 ACTIVITY DETAILS
                    </h4>
                    <div className="space-y-2 bg-white p-3 border-3 border-black">
                      <p className="text-sm"><span className="font-black">Title:</span> {selectedActivityData.title}</p>
                      <p className="text-sm"><span className="font-black">Max Points:</span> {selectedActivityData.maxPoints}</p>
                      <p className="text-sm"><span className="font-black">Classes:</span> {selectedActivityData.classIds?.map(c => c.name).join(', ') || 'N/A'}</p>
                      <p className="text-sm"><span className="font-black">Due Date:</span> {new Date(selectedActivityData.dueDate).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                )}

                {csvData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-6 border-black p-6"
                    style={{ boxShadow: '8px 8px 0px #000' }}
                  >
                    <h4 className="font-black text-lg uppercase mb-3 flex items-center gap-2">
                      📊 CSV SUMMARY
                    </h4>
                    <div className="space-y-2 bg-[#F8F9FA] p-3 border-3 border-black">
                      <p className="text-sm"><span className="font-black">File Name:</span> {csvFile.name}</p>
                      <p className="text-sm"><span className="font-black">Columns:</span> {csvData.headers.join(', ')}</p>
                      <p className="text-sm"><span className="font-black">Records:</span> <span className="bg-[#FFEB3B] px-2 py-1 font-black">{csvData.rows.length}</span></p>
                    </div>
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 border-6 border-red-600 p-6"
                  >
                    <h4 className="font-black text-lg uppercase mb-2 flex items-center gap-2 text-red-600">
                      <AlertCircle size={24} /> ERROR
                    </h4>
                    <p className="text-sm font-bold text-red-700">{error}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleSubmitMarks}
                  disabled={!selectedActivity || !csvFile || uploading}
                  className="w-full bg-black text-white border-6 border-black p-6 font-black uppercase text-xl flex items-center justify-center gap-3 hover:bg-[#00FF00] hover:text-black active:scale-95 transition-all disabled:opacity-50"
                  style={{ boxShadow: '8px 8px 0px #00FFFF' }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={28} /> UPLOADING...
                    </>
                  ) : (
                    <>
                      🚀 SUBMIT MARKS <ArrowRight size={28} />
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/teacher/create-activity')}
                  className="w-full bg-white border-6 border-black p-4 font-black uppercase text-lg flex items-center justify-center gap-3 hover:bg-[#FFEB3B] active:scale-95 transition-all"
                  style={{ boxShadow: '4px 4px 0px #000' }}
                >
                  <Home size={24} /> BACK TO ACTIVITIES
                </button>
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
                className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                onClick={() => setPreviewMode(false)}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 50 }}
                  className="bg-white border-8 border-black max-w-6xl w-full max-h-[85vh] overflow-auto"
                  style={{ boxShadow: '20px 20px 0px rgba(0,0,0,0.5)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-gradient-to-r from-[#FFEB3B] to-[#FF00FF] border-b-8 border-black p-6 flex justify-between items-center">
                    <h3 className="text-3xl font-black uppercase text-black flex items-center gap-2">
                      <Table size={32} /> CSV PREVIEW
                    </h3>
                    <button
                      onClick={() => setPreviewMode(false)}
                      className="bg-black text-white p-3 hover:bg-red-600 border-2 border-white font-black transition-all"
                    >
                      <X size={28} />
                    </button>
                  </div>

                  <div className="p-8 overflow-x-auto">
                    <div className="border-6 border-black bg-white overflow-hidden">
                      <div className="bg-black text-white border-b-4 border-black flex font-black uppercase text-sm sticky top-0">
                        {csvData.headers.map((header) => (
                          <div
                            key={header}
                            className="flex-1 min-w-32 p-4 border-r-2 border-white last:border-r-0"
                          >
                            {header}
                          </div>
                        ))}
                      </div>

                      <div className="divide-y-2 divide-black">
                        {csvData.rows.map((row, idx) => (
                          <div key={idx} className="flex hover:bg-[#FFFACD] transition-all bg-white">
                            {csvData.headers.map((header) => (
                              <div
                                key={header}
                                className="flex-1 min-w-32 p-4 border-r-2 border-gray-300 last:border-r-0 font-bold text-sm"
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
                initial={{ opacity: 0, scale: 0.7, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 50 }}
                className="fixed bottom-8 right-8 z-[100]"
              >
                <div
                  className={`${
                    status === 'success' ? 'bg-[#00FF00]' : 'bg-[#FF0000]'
                  } border-6 border-black p-6 flex items-center gap-4 text-black font-black`}
                  style={{ boxShadow: '10px 10px 0px rgba(0,0,0,0.4)' }}
                >
                  {status === 'success' ? (
                    <CheckCircle2 size={36} />
                  ) : (
                    <AlertCircle size={36} className="text-white" />
                  )}
                  <div className={status === 'success' ? 'text-black' : 'text-white'}>
                    <h4 className="font-black uppercase text-base">
                      {status === 'success' ? '✓ Success!' : '✗ Error'}
                    </h4>
                    <p className="text-xs font-bold">
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
