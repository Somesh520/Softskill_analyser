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
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] bg-background">
        <Loader className="animate-spin text-primary w-12 h-12 mb-4" />
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
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl text-primary flex items-center justify-center shrink-0">
              <ClipboardList size={48} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">My Surveys</h2>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">
                Share Your Feedback
              </p>
            </div>
          </div>
        </motion.div>

        {activeSurvey ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl shadow-sm p-6 lg:p-10 max-w-4xl mx-auto relative"
          >
            <button 
              onClick={() => setActiveSurvey(null)}
              className="mb-8 font-semibold text-foreground/60 hover:text-foreground flex items-center gap-2 transition-colors"
            >
              ← Back to Surveys
            </button>
            
            <h3 className="text-3xl font-bold mb-3 text-foreground tracking-tight">{activeSurvey.title}</h3>
            <p className="text-foreground/70 text-lg mb-8 leading-relaxed">{activeSurvey.description || 'Please provide your honest feedback.'}</p>

            {error && <div className="bg-red-500/10 text-red-500 font-semibold p-4 mb-6 border border-red-500/20 rounded-xl flex items-center gap-2"><Loader className="w-5 h-5 hidden" /> {error}</div>}
            {success && <div className="bg-green-500/10 text-green-600 font-semibold p-4 mb-6 border border-green-500/20 rounded-xl flex items-center gap-2"><CheckCircle2 /> {success}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {activeSurvey.questions.map((q, idx) => (
                <div key={q.id} className="bg-background border border-border rounded-xl shadow-sm p-6 md:p-8">
                  <label className="block text-xl font-semibold mb-6 text-foreground flex items-center gap-3">
                    <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-md text-sm font-bold tracking-wider">Q{idx + 1}</span> 
                    {q.text}
                  </label>
                  
                  {q.type === 'rating' ? (
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(q.id, star)}
                          className={`p-3 border border-border rounded-xl transition-all hover:scale-105 active:scale-95 ${answers[q.id] >= star ? 'bg-amber-500/10 border-amber-500/20' : 'bg-card hover:bg-accent'}`}
                        >
                          <Star size={32} className={`${answers[q.id] >= star ? 'fill-amber-500 text-amber-500' : 'text-foreground/20'}`} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea 
                      rows="4"
                      required
                      value={answers[q.id]}
                      onChange={e => handleTextChange(q.id, e.target.value)}
                      className="w-full bg-card border border-border rounded-xl p-4 text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      placeholder="Type your answer here..."
                    />
                  )}
                </div>
              ))}

              <button 
                type="submit" 
                disabled={submitting || success}
                className="bg-primary text-primary-foreground border border-transparent rounded-xl px-8 py-4 font-semibold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-4"
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
                className={`border border-border rounded-2xl shadow-sm p-6 relative flex flex-col mt-4 transition-all hover:shadow-md ${survey.isSubmitted ? 'bg-background/50 opacity-75' : (isAdminSurvey ? 'bg-primary/5' : 'bg-card')}`}
              >
                {isAdminSurvey && (
                  <span className="absolute -top-4 -right-2 bg-primary text-primary-foreground px-3 py-1 font-semibold tracking-wider text-xs border border-primary/20 rounded-full shadow-sm z-10" >
                     🎓 Admin / Global
                  </span>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-primary/10 text-primary p-3 rounded-xl">
                      <FileText size={24} />
                    </div>
                    {survey.isSubmitted ? (
                      <span className="bg-green-500/10 text-green-600 font-semibold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-green-500/20">
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-600 font-semibold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-amber-500/20 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Pending
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold mb-2 tracking-tight text-foreground">{survey.title}</h4>
                  <p className="text-sm font-semibold text-foreground/50 mb-6 flex items-center gap-2">
                    {isAdminSurvey ? 'From: University Administration' : `By ${survey.teacherId?.name || 'Instructor'}`}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleOpenSurvey(survey)}
                  disabled={survey.isSubmitted}
                  className={`w-full py-3 border rounded-xl font-semibold tracking-wide transition-colors ${survey.isSubmitted ? 'bg-background border-border text-foreground/40 cursor-not-allowed' : 'bg-card border-border hover:bg-accent hover:text-foreground text-foreground/80'}`}
                >
                  {survey.isSubmitted ? 'Already Submitted' : 'Take Survey'}
                </button>
              </motion.div>
            )})}

            {surveys.length === 0 && (
              <div className="col-span-full bg-card border border-border rounded-2xl shadow-sm border-dashed p-16 text-center">
                <ClipboardList size={48} className="mx-auto text-foreground/20 mb-4" />
                <p className="text-2xl font-bold text-foreground/40">No Pending Surveys</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentSurveys;
