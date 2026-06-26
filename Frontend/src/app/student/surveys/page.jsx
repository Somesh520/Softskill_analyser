"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Star, Send, Loader, CheckCircle2, ClipboardList } from 'lucide-react';
import { getStudentSurveys, submitSurvey } from '../../../api/studentApi';

const StudentSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const data = await getStudentSurveys();
      setSurveys(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load surveys.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSurvey = (survey) => {
    setActiveSurvey(survey);
    const initialAnswers = {};
    survey.questions.forEach(q => {
      initialAnswers[q.id] = q.type === 'rating' ? 0 : '';
    });
    setAnswers(initialAnswers);
    setSuccess('');
    setError('');
  };

  const handleRatingChange = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const handleTextChange = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      
      // format answers array
      const answersArray = Object.keys(answers).map(key => ({
        questionId: key,
        answer: answers[key]
      }));

      await submitSurvey(activeSurvey._id, answersArray);
      
      setSuccess('Survey submitted successfully!');
      setTimeout(() => {
        setActiveSurvey(null);
        fetchSurveys(); // Refresh list
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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
          className="mb-8 bg-[#00FF00] border-8 border-black p-8 relative"
          style={{ boxShadow: '12px 12px 0px #000' }}
        >
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 border-4 border-black transform -rotate-3" style={{ boxShadow: '4px 4px 0px #000' }}>
              <ClipboardList size={48} />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase mb-2 text-black drop-shadow-md">My Surveys</h2>
              <p className="text-sm font-black bg-black text-white inline-block px-3 py-1 uppercase tracking-widest">Share Your Feedback</p>
            </div>
          </div>
        </motion.div>

        {activeSurvey ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-8 border-black p-8 max-w-4xl mx-auto"
            style={{ boxShadow: '12px 12px 0px #000' }}
          >
            <button 
              onClick={() => setActiveSurvey(null)}
              className="mb-6 font-black uppercase border-b-4 border-black hover:text-[#FF0000] transition-colors"
            >
              ← Back to Surveys
            </button>
            
            <h3 className="text-3xl font-black uppercase mb-2">{activeSurvey.title}</h3>
            <p className="text-gray-600 font-bold mb-8">{activeSurvey.description || 'Please provide your honest feedback.'}</p>

            {error && <div className="bg-red-500 text-white font-black p-4 mb-6 border-4 border-black uppercase">{error}</div>}
            {success && <div className="bg-[#00FF00] text-black font-black p-4 mb-6 border-4 border-black uppercase flex items-center gap-2"><CheckCircle2 /> {success}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {activeSurvey.questions.map((q, idx) => (
                <div key={q.id} className="bg-[#f8f8f8] border-4 border-black p-6">
                  <label className="block text-xl font-black mb-4">
                    <span className="bg-black text-white px-3 py-1 mr-3">Q{idx + 1}</span> 
                    {q.text}
                  </label>
                  
                  {q.type === 'rating' ? (
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(q.id, star)}
                          className={`p-3 border-4 border-black transition-transform hover:-translate-y-1 ${answers[q.id] >= star ? 'bg-[#FFEB3B]' : 'bg-white'}`}
                          style={{ boxShadow: '4px 4px 0px #000' }}
                        >
                          <Star size={32} className={answers[q.id] >= star ? 'fill-black' : ''} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea 
                      rows="4"
                      required
                      value={answers[q.id]}
                      onChange={e => handleTextChange(q.id, e.target.value)}
                      className="w-full border-4 border-black p-4 font-bold outline-none focus:bg-[#00FFFF]"
                      placeholder="Type your answer here..."
                    />
                  )}
                </div>
              ))}

              <button 
                type="submit" 
                disabled={submitting || success}
                className="bg-black text-white border-4 border-black px-8 py-4 font-black uppercase text-xl hover:bg-[#FF00FF] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.3)' }}
              >
                {submitting ? <Loader className="animate-spin" /> : <Send />}
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {surveys.map(survey => {
              const isAdminSurvey = survey.isGlobal || survey.teacherId?.role === 'admin';
              return (
              <motion.div 
                key={survey._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-8 border-black p-6 relative flex flex-col mt-4 ${survey.isSubmitted ? 'bg-[#e0e0e0] opacity-75' : (isAdminSurvey ? 'bg-[#FFFF00] hover:-translate-y-1 transition-transform' : 'bg-white hover:-translate-y-1 transition-transform')}`}
                style={{ boxShadow: '8px 8px 0px #000' }}
              >
                {isAdminSurvey && (
                  <span className="absolute -top-6 -right-4 bg-[#FF00FF] text-white px-3 py-1 font-black uppercase text-sm border-4 border-black transform rotate-6 z-10" style={{ boxShadow: '4px 4px 0px #000' }}>
                     🎓 Admin / Global
                  </span>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-black text-white p-2 border-2 border-black transform -rotate-6">
                      <FileText size={24} />
                    </div>
                    {survey.isSubmitted ? (
                      <span className="bg-[#00FF00] text-black font-black uppercase px-2 py-1 border-2 border-black text-xs flex items-center gap-1">
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    ) : (
                      <span className="bg-[#FF0000] text-white font-black uppercase px-2 py-1 border-2 border-black text-xs animate-pulse">
                        Pending
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-black uppercase mb-2">{survey.title}</h4>
                  <p className="text-sm font-bold text-gray-600 mb-6">
                    {isAdminSurvey ? 'From: University Administration' : `By ${survey.teacherId?.name || 'Instructor'}`}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleOpenSurvey(survey)}
                  disabled={survey.isSubmitted}
                  className={`w-full py-3 border-4 border-black font-black uppercase tracking-wider ${survey.isSubmitted ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#00FFFF] hover:bg-[#FFEB3B] transition-colors'}`}
                  style={{ boxShadow: '4px 4px 0px #000' }}
                >
                  {survey.isSubmitted ? 'Already Submitted' : 'Take Survey'}
                </button>
              </motion.div>
            )})}

            {surveys.length === 0 && (
              <div className="col-span-full bg-[#f8f8f8] border-8 border-black border-dashed p-12 text-center">
                <p className="text-2xl font-black uppercase text-gray-400">No Pending Surveys</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentSurveys;
