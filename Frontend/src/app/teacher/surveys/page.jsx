"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, List, Loader, Sparkles, User, Activity, Trash2, X, Eye, Download } from 'lucide-react';
import { getTeacherSurveys, createSurvey, toggleSurveyStatus, getClasses, generateSurveyQuestions, getSurveyResponses, deleteSurvey } from '../../../api/teacherApi';

const TeacherSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [surveysData, classesData] = await Promise.all([
        getTeacherSurveys(),
        getClasses().catch(() => [])
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
      if (!formData.classId) return setError("Please select a class");
      if (!formData.title) return setError("Title is required");
      if (formData.questions.length === 0) return setError("Add at least one question");

      await createSurvey(formData);
      setIsCreating(false);
      setFormData({ title: '', description: '', classId: '', questions: [], isActive: false });
      setAiTopic('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleSurveyStatus(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewResponses = async (survey) => {
    try {
      setLoading(true);
      const data = await getSurveyResponses(survey._id);
      setResponses(data);
      setViewingSurvey(survey);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this survey? This action cannot be undone and will delete all responses.")) return;
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
        <Loader className="animate-spin text-black w-16 h-16" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-[#FF00FF] border-8 border-black p-8 text-white relative"
          style={{ boxShadow: '12px 12px 0px #000' }}
        >
          <h2 className="text-4xl font-black uppercase mb-2 text-white drop-shadow-md">Feedback Surveys</h2>
          <p className="text-sm font-black bg-black inline-block px-3 py-1">Manage Class Surveys & AI Builder</p>
          
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="absolute right-8 top-8 bg-[#00FFFF] text-black border-4 border-black px-6 py-3 font-black uppercase flex items-center gap-2 hover:-translate-y-1 transition-transform"
            style={{ boxShadow: '4px 4px 0px #000' }}
          >
            {isCreating ? <List /> : <Plus />}
            {isCreating ? 'View All' : 'Create New'}
          </button>
        </motion.div>

        {error && (
          <div className="bg-red-500 text-white font-black p-4 mb-6 border-4 border-black uppercase">
            {error}
          </div>
        )}

        {isCreating ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.form 
              onSubmit={handleCreate}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2 bg-white border-8 border-black p-8"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3"><Plus /> Survey Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-black uppercase mb-2">Survey Title</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full border-4 border-black p-3 font-bold outline-none focus:bg-[#00FFFF]"
                    placeholder="e.g. End of Semester Feedback"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black uppercase mb-2">Target Class</label>
                  <select 
                    value={formData.classId}
                    onChange={e => setFormData({...formData, classId: e.target.value})}
                    className="w-full border-4 border-black p-3 font-bold outline-none cursor-pointer"
                  >
                    <option value="">Select a Class...</option>
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>{c.branch} - Sem {c.semester} - Sec {c.section}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-lg font-black uppercase">Questions List</label>
                  <button type="button" onClick={addManualQuestion} className="bg-black text-white px-4 py-2 font-black uppercase text-sm border-2 border-black hover:bg-gray-800">
                    + Add Question
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  {formData.questions.map((q, i) => (
                    <div key={i} className="bg-[#f0f0f0] border-4 border-black p-4 flex gap-4 items-start">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={q.text} 
                          onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                          className="w-full border-2 border-black p-2 font-bold outline-none mb-2"
                        />
                        <select 
                          value={q.type}
                          onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                          className="border-2 border-black p-2 font-bold text-sm bg-white cursor-pointer"
                        >
                          <option value="text">Short Answer (Text)</option>
                          <option value="rating">Star Rating (1-5)</option>
                        </select>
                      </div>
                      <button type="button" onClick={() => removeQuestion(i)} className="bg-red-500 text-white p-2 border-2 border-black hover:bg-red-600">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                  {formData.questions.length === 0 && (
                    <p className="text-gray-500 font-bold border-4 border-dashed border-gray-400 p-8 text-center uppercase">No questions added yet. Use the builder or AI Magic.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <input 
                  type="checkbox" 
                  id="publishNow"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-6 h-6 border-4 border-black"
                />
                <label htmlFor="publishNow" className="font-black uppercase">Publish Immediately to Students</label>
              </div>

              <button type="submit" className="bg-[#00FF00] border-4 border-black px-8 py-4 font-black uppercase text-xl hover:bg-[#FFEB3B] transition-colors" style={{ boxShadow: '6px 6px 0px #000' }}>
                Save & Create
              </button>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#FFFF00] border-8 border-black p-8 h-fit"
              style={{ boxShadow: '12px 12px 0px #000' }}
            >
              <h3 className="text-2xl font-black uppercase mb-2 flex items-center gap-2"><Sparkles /> AI Magic</h3>
              <p className="font-bold text-sm mb-6">Let AI instantly generate perfect survey questions for your topic.</p>
              
              <label className="block text-sm font-black uppercase mb-2">Survey Topic</label>
              <textarea 
                rows="3"
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                placeholder="e.g., Guest Lecture on Resume Building"
                className="w-full border-4 border-black p-3 font-bold outline-none focus:bg-white mb-4"
              />
              <button 
                type="button"
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="w-full bg-black text-white border-4 border-black px-6 py-3 font-black uppercase flex items-center justify-center gap-2 hover:bg-[#FF00FF] disabled:opacity-50 transition-colors"
              >
                {aiLoading ? <Loader className="animate-spin" /> : <Sparkles />}
                {aiLoading ? 'Generating...' : 'Generate Questions'}
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {surveys.map(survey => (
              <motion.div 
                key={survey._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border-8 border-black p-6 relative"
                style={{ boxShadow: '8px 8px 0px #000' }}
              >
                <div className="flex justify-between items-start mb-4 border-b-4 border-black pb-4">
                  <div>
                    <h4 className="text-2xl font-black uppercase">{survey.title}</h4>
                    <p className="font-bold text-gray-600">
                      {survey.classId ? `${survey.classId.branch} - Sem ${survey.classId.semester}` : 'Unknown Class'}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleToggle(survey._id)}
                    className={`px-4 py-2 border-4 border-black font-black uppercase text-sm ${survey.isActive ? 'bg-[#00FF00]' : 'bg-[#FF0000] text-white'}`}
                    style={{ boxShadow: '4px 4px 0px #000' }}
                  >
                    {survey.isActive ? 'LIVE' : 'DRAFT'}
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6 border-t-2 border-dashed border-gray-300 pt-4">
                  <div className="flex flex-wrap items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-2 font-black uppercase text-sm md:text-base">
                      <User size={18} /> {survey.responseCount || 0} Responses
                    </div>
                    <div className="flex items-center gap-2 font-black uppercase text-gray-500 text-sm md:text-base">
                      <Activity size={18} /> {survey.questions.length} Questions
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleViewResponses(survey)}
                      className="flex-1 md:flex-none justify-center bg-black text-white px-4 py-2 font-black uppercase text-sm flex items-center gap-2 hover:bg-[#00FFFF] hover:text-black transition-colors border-2 border-black"
                    >
                      <Eye size={16} /> View
                    </button>
                    <button 
                      onClick={() => handleDelete(survey._id)}
                      className="flex-1 md:flex-none justify-center bg-red-500 text-white px-4 py-2 font-black uppercase text-sm flex items-center gap-2 hover:bg-red-600 transition-colors border-2 border-black"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {surveys.length === 0 && (
              <div className="col-span-full bg-[#f8f8f8] border-8 border-black border-dashed p-12 text-center">
                <p className="text-2xl font-black uppercase text-gray-400">No Surveys Created Yet</p>
              </div>
            )}
          </div>
        )}

        {/* View Responses Modal */}
        {viewingSurvey && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white border-8 border-black p-8 max-w-4xl w-full my-8 relative" style={{ boxShadow: '12px 12px 0px #00FFFF' }}>
              <button 
                onClick={() => setViewingSurvey(null)}
                className="absolute top-4 right-4 bg-red-500 text-white p-2 border-4 border-black hover:bg-red-600"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black uppercase mb-2">Responses: {viewingSurvey.title}</h2>
              <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
                <p className="font-bold text-gray-600">
                  Total Submissions: {responses.length}
                </p>
                {responses.length > 0 && (
                  <button 
                    onClick={downloadCSV}
                    className="bg-[#00FF00] text-black px-4 py-2 font-black uppercase text-sm flex items-center gap-2 border-2 border-black hover:-translate-y-1 transition-transform"
                    style={{ boxShadow: '4px 4px 0px #000' }}
                  >
                    <Download size={16} /> Export CSV
                  </button>
                )}
              </div>

              {responses.length === 0 ? (
                <div className="bg-gray-100 p-8 text-center border-4 border-dashed border-gray-400">
                  <p className="text-xl font-black uppercase text-gray-500">No responses yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {responses.map((resp, idx) => (
                    <div key={resp._id} className="bg-[#f0f0f0] border-4 border-black p-6">
                      <h4 className="font-black uppercase text-xl mb-4 bg-black text-white inline-block px-3 py-1">
                        Student: {resp.studentId?.name} ({resp.studentId?.rollNo})
                      </h4>
                      <div className="flex flex-col gap-4">
                        {resp.answers.map((ans, i) => {
                          // Find question text
                          const question = viewingSurvey.questions.find(q => q.id === ans.questionId);
                          return (
                            <div key={i} className="bg-white border-2 border-black p-4">
                              <p className="font-black text-sm mb-2 text-gray-700">Q: {question?.text || ans.questionId}</p>
                              {question?.type === 'rating' ? (
                                <p className="font-black text-xl text-[#FFEB3B] drop-shadow-md">
                                  {Array.from({length: ans.answer}).map((_, j) => '★').join('')} 
                                  <span className="text-gray-300">{Array.from({length: 5 - ans.answer}).map((_, j) => '★').join('')}</span>
                                </p>
                              ) : (
                                <p className="font-bold">A: {ans.answer}</p>
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
        )}

      </main>
    </div>
  );
};

export default TeacherSurveys;
