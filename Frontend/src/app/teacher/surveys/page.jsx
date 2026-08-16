"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, List, Loader2, Sparkles, User, Activity, Trash2, X, Eye, Download, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { getTeacherSurveys, createSurvey, toggleSurveyStatus, getClasses, generateSurveyQuestions, getSurveyResponses, deleteSurvey } from '../../../api/teacherApi';
import { useToast } from '../../../context/ToastContext';

const TeacherSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const { showConfirm } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    questions: [],
    isActive: false
  });

  // AI State
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Responses State
  const [viewingSurvey, setViewingSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [surveysData, classesData] = await Promise.all([
        getTeacherSurveys(),
        getClasses().catch(() => [])
      ]);
      setSurveys(surveysData);
      setClasses(classesData);
    } catch (err) {
      console.error(err);
      setError('Failed to load surveys data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!formData.classId) return setError("Please select a class");
      if (!formData.title) return setError("Title is required");
      if (formData.questions.length === 0) return setError("Add at least one question");

      setCreateLoading(true);
      await createSurvey(formData);
      setIsCreating(false);
      setFormData({ title: '', description: '', classId: '', questions: [], isActive: false });
      setAiTopic('');
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleSurveyStatus(id);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to toggle status.');
    }
  };

  const handleViewResponses = async (survey) => {
    try {
      setResponsesLoading(true);
      setViewingSurvey(survey); // Open modal early to show loader
      const data = await getSurveyResponses(survey._id);
      setResponses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setResponsesLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('This will permanently delete this survey and all its responses.');
    if (!confirmed) return;
    try {
      await deleteSurvey(id);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiTopic) return setError("Please enter a topic for AI generation");
    try {
      setAiLoading(true);
      setError('');
      const data = await generateSurveyQuestions(aiTopic);
      if (data && data.questions) {
        setFormData({ ...formData, questions: [...formData.questions, ...data.questions] });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!viewingSurvey || responses.length === 0) return;

    // Create CSV Header
    const headers = ['Student Name', 'Roll No'];
    viewingSurvey.questions.forEach(q => headers.push(`"${q.text.replace(/"/g, '""')}"`));
    
    // Create CSV Rows
    const rows = responses.map(resp => {
      const row = [
        `"${(resp.studentId?.name || 'Unknown').replace(/"/g, '""')}"`,
        `"${(resp.studentId?.rollNo || 'N/A').replace(/"/g, '""')}"`
      ];
      
      viewingSurvey.questions.forEach(q => {
        const answerObj = resp.answers.find(a => a.questionId === q.id);
        const ansText = answerObj ? String(answerObj.answer).replace(/"/g, '""') : '';
        row.push(`"${ansText}"`);
      });
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Survey_${viewingSurvey.title.replace(/\s+/g, '_')}_Responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addManualQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions, 
        { id: 'q' + Date.now(), text: '', type: 'text' }
      ]
    });
  };

  const updateQuestion = (index, field, value) => {
    const newQs = [...formData.questions];
    newQs[index][field] = value;
    setFormData({ ...formData, questions: newQs });
  };

  const removeQuestion = (index) => {
    const newQs = [...formData.questions];
    newQs.splice(index, 1);
    setFormData({ ...formData, questions: newQs });
  };

  if (loading && surveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-background p-6">
        <Loader2 size={48} className="animate-spin text-primary mb-4" />
        <p className="text-xl font-bold text-foreground">Loading Surveys...</p>
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
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
                <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl text-primary flex items-center justify-center shrink-0">
                  <MessageSquare size={40} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">Feedback Surveys</h2>
                  <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">
                    Manage Class Surveys & AI Builder
                  </p>
                </div>
            </div>
            
            <button 
              onClick={() => {
                  setIsCreating(!isCreating);
                  setError('');
              }}
              className="bg-primary text-primary-foreground border border-primary rounded-xl shadow-sm px-6 py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity w-full md:w-auto shrink-0"
            >
              {isCreating ? <List size={18} /> : <Plus size={18} />}
              {isCreating ? 'View All Surveys' : 'Create New Survey'}
            </button>
          </div>
        </motion.div>

        {error && (
            <div className="mb-8 bg-red-500/10 text-red-500 p-4 border border-red-500/20 rounded-xl shadow-sm font-semibold flex items-center justify-between gap-3">
             <div className="flex items-center gap-2">
                <AlertCircle size={20} /> 
                <span className="text-sm">{error}</span>
             </div>
             <button onClick={() => setError('')} className="p-1 hover:bg-red-500/20 rounded-lg"><X size={16}/></button>
           </div>
        )}

        <AnimatePresence mode="wait">
            {isCreating ? (
            <motion.div 
                key="creating"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
                {/* Create Form */}
                <form 
                onSubmit={handleCreate}
                className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-6 lg:p-8 space-y-6"
                >
                <h3 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-6">
                    <Plus className="text-primary" size={24} /> Survey Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/70 block">Survey Title *</label>
                        <input 
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-foreground/40"
                            placeholder="e.g. End of Semester Feedback"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/70 block">Target Class *</label>
                        <select 
                            required
                            value={formData.classId}
                            onChange={e => setFormData({...formData, classId: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground cursor-pointer"
                        >
                            <option value="">-- Select a Class --</option>
                            {classes.map(c => (
                            <option key={c._id} value={c._id}>{c.name} ({c.section || 'A'})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-lg font-bold text-foreground flex items-center gap-2">
                            <List size={20} className="text-primary"/> Questions List
                        </label>
                        <button 
                            type="button" 
                            onClick={addManualQuestion} 
                            className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 font-semibold text-xs rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1.5"
                        >
                            <Plus size={16} /> Add Question
                        </button>
                    </div>
                    
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {formData.questions.map((q, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={i} 
                                className="bg-background border border-border rounded-xl shadow-sm p-4 flex gap-4 items-start group"
                            >
                                <span className="bg-foreground/5 text-foreground/50 w-8 h-8 flex items-center justify-center font-bold text-sm rounded-lg shrink-0 mt-1">
                                    {i + 1}
                                </span>
                                <div className="flex-1 space-y-3">
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Enter question text..."
                                        value={q.text} 
                                        onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                                        className="w-full bg-transparent border-b border-border/50 pb-2 font-medium focus:outline-none focus:border-primary text-foreground placeholder:text-foreground/40 text-sm"
                                    />
                                    <div className="flex items-center gap-3">
                                        <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Type</label>
                                        <select 
                                            value={q.type}
                                            onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                                            className="bg-card border border-border rounded-lg px-3 py-1.5 font-medium text-xs text-foreground cursor-pointer focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="text">Short Answer (Text)</option>
                                            <option value="rating">Star Rating (1-5)</option>
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removeQuestion(i)} 
                                    className="text-foreground/30 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer mt-1"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </motion.div>
                        ))}
                        {formData.questions.length === 0 && (
                            <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center text-foreground/50 bg-background/50">
                                <List size={32} className="mx-auto mb-3 opacity-50" />
                                <p className="font-semibold text-sm">No questions added yet.</p>
                                <p className="text-xs mt-1">Use the builder or AI Magic to generate some.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${formData.isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border group-hover:border-primary/50'}`}>
                            {formData.isActive && <Plus size={16} className="rotate-45" style={{ display: 'none' }} />}
                            {formData.isActive && <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden"
                            checked={formData.isActive}
                            onChange={e => setFormData({...formData, isActive: e.target.checked})}
                        />
                        <span className="font-semibold text-sm text-foreground select-none">Publish Immediately</span>
                    </label>
                </div>

                <button 
                    type="submit" 
                    disabled={createLoading}
                    className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-bold text-lg hover:opacity-90 transition-opacity flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed" 
                >
                    {createLoading ? <Loader2 size={24} className="animate-spin" /> : 'Save & Create Survey'}
                </button>
                </form>

                {/* AI Magic Sidebar */}
                <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-2xl shadow-sm p-6 lg:p-8 h-fit sticky top-6"
                >
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">AI Magic</h3>
                </div>
                <p className="font-medium text-sm text-foreground/70 mb-6">Instantly generate perfect survey questions for your topic using AI.</p>
                
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/70 block">Survey Topic</label>
                        <textarea 
                            rows="3"
                            value={aiTopic}
                            onChange={e => setAiTopic(e.target.value)}
                            placeholder="e.g., Guest Lecture on Resume Building"
                            className="w-full bg-background border border-border rounded-xl shadow-sm p-4 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-foreground placeholder:text-foreground/40 resize-none text-sm"
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={handleAiGenerate}
                        disabled={aiLoading}
                        className="w-full bg-purple-500 text-white rounded-xl shadow-sm px-6 py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-purple-600 disabled:opacity-50 transition-colors"
                    >
                        {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        {aiLoading ? 'Generating...' : 'Generate Questions'}
                    </button>
                </div>
                </motion.div>
            </motion.div>
            ) : (
            <motion.div 
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {surveys.map((survey, idx) => (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    key={survey._id}
                    className="bg-card border border-border rounded-2xl shadow-sm p-6 relative hover:border-primary/30 transition-colors flex flex-col"
                >
                    <div className="flex justify-between items-start mb-4 border-b border-border/50 pb-4">
                    <div className="pr-4">
                        <h4 className="text-xl font-bold text-foreground line-clamp-1">{survey.title}</h4>
                        <p className="font-semibold text-xs text-foreground/50 mt-1">
                        {survey.classId ? `${survey.classId.name || survey.classId.branch} - ${survey.classId.section || 'A'}` : 'Unknown Class'}
                        </p>
                    </div>
                    <button 
                        onClick={() => handleToggle(survey._id)}
                        className={`px-3 py-1 border rounded-lg font-bold text-xs shrink-0 transition-colors ${survey.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : 'bg-foreground/5 text-foreground/50 border-border hover:bg-foreground/10'}`}
                    >
                        {survey.isActive ? 'LIVE' : 'DRAFT'}
                    </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground/70 bg-foreground/5 px-2.5 py-1.5 rounded-md">
                        <User size={14} className="text-primary/70" /> 
                        <span><span className="font-bold text-foreground">{survey.responseCount || 0}</span> Responses</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground/70 bg-foreground/5 px-2.5 py-1.5 rounded-md">
                        <Activity size={14} className="text-primary/70" /> 
                        <span><span className="font-bold text-foreground">{survey.questions?.length || 0}</span> Qs</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <button 
                        onClick={() => handleViewResponses(survey)}
                        className="flex-1 sm:flex-none justify-center bg-primary/10 text-primary px-3 py-2 font-semibold text-xs flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors rounded-lg"
                        >
                        <Eye size={16} /> View
                        </button>
                        <button 
                        onClick={() => handleDelete(survey._id)}
                        className="justify-center text-foreground/40 hover:text-red-500 hover:bg-red-500/10 px-3 py-2 font-semibold text-xs flex items-center gap-1.5 transition-colors rounded-lg"
                        >
                        <Trash2 size={16} />
                        </button>
                    </div>
                    </div>
                </motion.div>
                ))}
                
                {surveys.length === 0 && (
                <div className="col-span-full bg-background border border-border border-dashed rounded-2xl p-12 text-center">
                    <MessageSquare size={48} className="mx-auto text-foreground/20 mb-4" />
                    <p className="text-xl font-bold text-foreground/50">No Surveys Created Yet</p>
                    <p className="text-sm font-medium text-foreground/40 mt-2">Create one to gather student feedback.</p>
                </div>
                )}
            </motion.div>
            )}
        </AnimatePresence>

        {/* View Responses Modal */}
        <AnimatePresence>
        {viewingSurvey && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={() => {
                if(!responsesLoading) setViewingSurvey(null);
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card border border-border rounded-2xl shadow-xl p-0 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-border bg-background">
                <div>
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <MessageSquare size={24} className="text-primary"/> {viewingSurvey.title}
                  </h2>
                  <p className="font-semibold text-xs text-foreground/50 mt-1">
                    Total Submissions: <span className="text-foreground">{responses.length}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {responses.length > 0 && !responsesLoading && (
                    <button 
                      onClick={downloadCSV}
                      className="bg-green-500/10 text-green-600 border border-green-500/20 px-3 py-2 font-semibold text-xs flex items-center gap-1.5 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      <Download size={16} /> Export CSV
                    </button>
                  )}
                  <button 
                    onClick={() => setViewingSurvey(null)}
                    disabled={responsesLoading}
                    className="text-foreground/50 hover:bg-foreground/5 hover:text-foreground p-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-background/50">
                {responsesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                     <Loader2 size={40} className="animate-spin text-primary mb-4" />
                     <p className="font-semibold text-foreground/60 text-sm">Loading responses...</p>
                  </div>
                ) : responses.length === 0 ? (
                  <div className="bg-background border-2 border-dashed border-border/50 rounded-xl p-12 text-center">
                    <p className="text-lg font-bold text-foreground/50 mb-2">No responses yet.</p>
                    <p className="text-sm font-medium text-foreground/40">Students haven't submitted anything to this survey.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {responses.map((resp, idx) => (
                      <div key={resp._id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-foreground/5 p-4 border-b border-border/50 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                                    <User size={16} className="text-primary/60"/> {resp.studentId?.name || 'Unknown Student'}
                                </h4>
                            </div>
                            <span className="text-xs font-semibold text-foreground/50 px-2 py-1 bg-background rounded border border-border">
                                {resp.studentId?.rollNo || 'N/A'}
                            </span>
                        </div>
                        <div className="p-4 space-y-4">
                          {resp.answers.map((ans, i) => {
                            const question = viewingSurvey.questions.find(q => q.id === ans.questionId);
                            return (
                              <div key={i} className="bg-background border border-border rounded-lg p-3">
                                <p className="font-semibold text-xs text-foreground/60 mb-2 leading-relaxed">
                                    <span className="text-primary font-bold mr-1">Q:</span> {question?.text || ans.questionId}
                                </p>
                                {question?.type === 'rating' ? (
                                  <div className="flex items-center gap-1 text-yellow-500">
                                    <span className="text-primary font-bold text-xs mr-1">A:</span>
                                    {Array.from({length: 5}).map((_, j) => (
                                        <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill={j < ans.answer ? "currentColor" : "none"} stroke={j < ans.answer ? "currentColor" : "var(--border)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="font-medium text-sm text-foreground bg-foreground/5 p-2 rounded-md border border-border/50">
                                    {ans.answer}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default TeacherSurveys;
