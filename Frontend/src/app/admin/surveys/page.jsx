"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, List, Loader, Sparkles, User, Activity, Trash2, X, Eye, Download } from 'lucide-react';
import { getAdminSurveys, createAdminSurvey, toggleAdminSurveyStatus, getAllClasses, generateAdminSurveyQuestions, getAdminSurveyResponses, deleteAdminSurvey } from '../../../api/adminApi';
import { useToast } from '../../../context/ToastContext';

const AdminSurveys = () => {
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
    isGlobal: false,
    questions: [],
    isActive: false
  });

  // AI State
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Responses State
  const [viewingSurvey, setViewingSurvey] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [surveysData, classesData] = await Promise.all([
        getAdminSurveys(),
        getAllClasses().catch(() => [])
      ]);
      setSurveys(surveysData);
      setClasses(classesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!formData.isGlobal && !formData.classId) return setError("Please select a class or choose Entire University");
      if (!formData.title) return setError("Title is required");
      if (formData.questions.length === 0) return setError("Add at least one question");

      await createAdminSurvey(formData);
      setIsCreating(false);
      setFormData({ title: '', description: '', classId: '', isGlobal: false, questions: [], isActive: false });
      setAiTopic('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleAdminSurveyStatus(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewResponses = async (survey) => {
    try {
      setLoading(true);
      const data = await getAdminSurveyResponses(survey._id);
      setResponses(data);
      setViewingSurvey(survey);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('This will permanently delete this survey and all its responses.');
    if (!confirmed) return;
    try {
      await deleteAdminSurvey(id);
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
      const data = await generateAdminSurveyQuestions(aiTopic);
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
        { id: 'q' + Date.now(), text: 'New Question', type: 'text' }
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
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-border rounded-full border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-card border border-border rounded-2xl shadow-sm p-8 relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2 flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl text-primary border border-primary/20">
                <List size={32} />
              </div>
              Feedback Surveys
            </h2>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">Manage Class Surveys & AI Builder</p>
          </div>
          
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-primary text-primary-foreground border border-primary/50 rounded-xl shadow-md px-6 py-3 font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            {isCreating ? <List size={20} /> : <Plus size={20} />}
            {isCreating ? 'View All' : 'Create New'}
          </button>
        </motion.div>

        {error && (
          <div className="bg-red-500/10 text-red-500 font-semibold p-4 mb-6 border border-red-500/20 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {isCreating ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            <motion.form 
              onSubmit={handleCreate}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-8"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground/90"><Plus className="text-primary" size={24}/> Survey Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-2">Survey Title</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl shadow-sm p-3 font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-foreground/30"
                    placeholder="e.g. End of Semester Feedback"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-2">Target Class</label>
                  <select 
                    value={formData.isGlobal ? 'GLOBAL' : formData.classId}
                    onChange={e => {
                        const val = e.target.value;
                        if (val === 'GLOBAL') {
                            setFormData({...formData, isGlobal: true, classId: ''});
                        } else {
                            setFormData({...formData, isGlobal: false, classId: val});
                        }
                    }}
                    className="w-full bg-background border border-border rounded-xl shadow-sm p-3 font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                  >
                    <option value="">Select a Class...</option>
                    <option value="GLOBAL">🌐 All Classes (Entire University)</option>
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>{c.branch} - Sem {c.semester} - Sec {c.section}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-lg font-bold text-foreground">Questions List</label>
                  <button type="button" onClick={addManualQuestion} className="bg-primary/10 text-primary px-4 py-2 font-semibold text-sm border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-2">
                    <Plus size={16} /> Add Question
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  {formData.questions.map((q, i) => (
                    <div key={i} className="bg-background border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="flex-1 w-full space-y-3">
                        <input 
                          type="text" 
                          value={q.text} 
                          onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                          className="w-full bg-card border border-border rounded-lg p-3 font-medium text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                          placeholder="Enter your question"
                        />
                        <select 
                          value={q.type}
                          onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                          className="w-full sm:w-auto bg-card border border-border rounded-lg p-2.5 font-medium text-sm text-foreground focus:outline-none cursor-pointer"
                        >
                          <option value="text">Short Answer (Text)</option>
                          <option value="rating">Star Rating (1-5)</option>
                        </select>
                      </div>
                      <button type="button" onClick={() => removeQuestion(i)} className="bg-red-500/10 text-red-500 p-3 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-colors self-end sm:self-auto">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                  {formData.questions.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 bg-background/50 border border-border border-dashed rounded-xl">
                      <List size={40} className="text-foreground/30 mb-4" />
                      <p className="text-foreground/60 font-medium text-center">No questions added yet.<br/>Use the builder or AI Magic.</p>
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-foreground/5 transition-colors cursor-pointer group mb-8">
                <input 
                  type="checkbox" 
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50"
                />
                <span className="font-semibold text-foreground/80 group-hover:text-foreground">Publish Immediately to Students</span>
              </label>

              <button type="submit" className="w-full bg-primary text-primary-foreground border border-primary/50 rounded-xl shadow-md py-4 font-bold text-lg hover:opacity-90 transition-opacity" >
                Save & Create
              </button>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-2xl p-8 h-fit shadow-sm"
            >
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-primary"><Sparkles size={24} /> AI Magic</h3>
              <p className="font-medium text-sm text-foreground/70 mb-6">Let AI instantly generate perfect survey questions for your topic.</p>
              
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Survey Topic</label>
              <textarea 
                rows="3"
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                placeholder="e.g., Guest Lecture on Resume Building"
                className="w-full bg-background border border-border rounded-xl p-4 font-medium text-foreground focus:outline-none focus:border-primary/50 transition-colors mb-6 resize-none placeholder:text-foreground/40"
              />
              <button 
                type="button"
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="w-full bg-primary text-primary-foreground border border-primary/50 rounded-xl shadow-sm py-4 font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {aiLoading ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {aiLoading ? 'Generating...' : 'Generate Questions'}
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            {surveys.map((survey, index) => (
              <motion.div 
                key={survey._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                className="bg-card border border-border rounded-2xl shadow-sm p-6 relative flex flex-col hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-border/50">
                  <div className="pr-4">
                    <h4 className="text-xl font-bold text-foreground mb-1 line-clamp-2">{survey.title}</h4>
                    <p className="font-medium text-sm text-foreground/60 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                      {survey.isGlobal ? 'Entire University' : (survey.classId ? `${survey.classId.branch} - Sem ${survey.classId.semester}` : 'Unknown Class')}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleToggle(survey._id)}
                    className={`px-3 py-1 border rounded-lg font-bold text-xs tracking-wider shrink-0 transition-colors ${survey.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : 'bg-foreground/5 text-foreground/60 border-border hover:bg-foreground/10'}`}
                  >
                    {survey.isActive ? 'LIVE' : 'DRAFT'}
                  </button>
                </div>
                
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 font-medium text-sm text-foreground/80 bg-background px-3 py-1.5 rounded-lg border border-border">
                      <User size={16} className="text-primary" /> {survey.responseCount || 0} Responses
                    </div>
                    <div className="flex items-center gap-2 font-medium text-sm text-foreground/80 bg-background px-3 py-1.5 rounded-lg border border-border">
                      <Activity size={16} className="text-primary" /> {survey.questions.length} Qs
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-auto pt-4">
                    <button 
                      onClick={() => handleViewResponses(survey)}
                      className="flex-1 bg-background border border-border rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-foreground/5 transition-colors text-foreground"
                    >
                      <Eye size={16} /> View
                    </button>
                    <button 
                      onClick={() => handleDelete(survey._id)}
                      className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl px-4 py-2.5 hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete Survey"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {surveys.length === 0 && (
              <div className="col-span-full bg-card border border-border rounded-2xl p-16 text-center">
                <div className="bg-foreground/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <List size={48} className="text-foreground/40" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">No Surveys Found</h2>
                <p className="text-foreground/60 font-medium">Create your first feedback survey.</p>
              </div>
            )}
          </div>
        )}

        {/* View Responses Modal */}
        {viewingSurvey && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-card border border-border rounded-2xl shadow-lg p-6 md:p-8 max-w-4xl w-full my-8 relative flex flex-col max-h-[90vh]">
              <button 
                onClick={() => setViewingSurvey(null)}
                className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors p-2"
              >
                <X size={24} />
              </button>
              
              <div className="shrink-0 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 pr-12">Responses: {viewingSurvey.title}</h2>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
                  <p className="font-semibold text-foreground/60 bg-foreground/5 px-3 py-1 rounded-lg">
                    Total Submissions: {responses.length}
                  </p>
                  {responses.length > 0 && (
                    <button 
                      onClick={downloadCSV}
                      className="bg-primary/10 text-primary px-4 py-2 font-semibold text-sm flex items-center gap-2 border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      <Download size={16} /> Export CSV
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto flex-1 pr-2">
                {responses.length === 0 ? (
                  <div className="bg-background border border-border border-dashed rounded-xl p-12 text-center">
                    <p className="text-lg font-medium text-foreground/50">No responses yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {responses.map((resp, idx) => (
                      <div key={resp._id} className="bg-background border border-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6 bg-primary/5 p-3 rounded-lg border border-primary/10">
                          <div className="bg-primary/20 p-2 rounded-lg text-primary">
                            <User size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-lg leading-tight">
                              {resp.studentId?.name}
                            </h4>
                            <p className="font-medium text-sm text-foreground/60">{resp.studentId?.rollNo}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          {resp.answers.map((ans, i) => {
                            const question = viewingSurvey.questions.find(q => q.id === ans.questionId);
                            return (
                              <div key={i} className="bg-card border border-border rounded-lg p-4">
                                <p className="font-medium text-sm mb-3 text-foreground/70">Q: {question?.text || ans.questionId}</p>
                                {question?.type === 'rating' ? (
                                  <div className="flex gap-1">
                                    {Array.from({length: 5}).map((_, j) => (
                                      <Star key={j} size={20} className={j < ans.answer ? "text-yellow-400 fill-yellow-400" : "text-foreground/20"} />
                                    ))}
                                  </div>
                                ) : (
                                  <p className="font-semibold text-foreground bg-background p-3 rounded-md border border-border/50">A: {ans.answer}</p>
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
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminSurveys;
