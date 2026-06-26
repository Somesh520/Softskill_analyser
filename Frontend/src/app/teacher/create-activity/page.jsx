"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  Plus, 
  Trash2, 
  Calendar, 
  Type, 
  FileText, 
  Target, 
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Download,
  Upload,
  X,
  History,
  Eye,
  Zap,
  RefreshCw,
  ChevronDown,
  FolderOpen,
  Save
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getClasses, 
  createActivity, 
  getActivities,
  deleteActivity,
  downloadActivityTemplate,
  uploadActivityMarks,
  getActivitySubmissions,
  editActivityMarks,
  getTeachersList
} from '../../../api/teacherApi';
import { useAuth } from '../../../context/AuthContext';

const CustomDatePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Pick a date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDay = (day) => {
    if (!day) return;
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const isSelected = (day) => {
    if (!day || !value) return false;
    const selectedDate = new Date(value);
    return day.getDate() === selectedDate.getDate() &&
           day.getMonth() === selectedDate.getMonth() &&
           day.getFullYear() === selectedDate.getFullYear();
  };

  const monthYearLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const displayValue = value ? formatDate(value) : 'Pick a date';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border-3 border-black p-3 font-bold uppercase flex justify-between items-center bg-white hover:bg-[#00FFFF] transition-all text-left text-sm cursor-pointer text-black"
        style={{ boxShadow: '4px 4px 0px #000' }}
      >
        <span>📅 {displayValue}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div 
            className="absolute top-full mt-3 left-0 bg-white border-4 border-black p-4 z-50 w-72 text-black"
            style={{ boxShadow: '6px 6px 0px #000' }}
          >
            <div className="flex justify-between items-center mb-4">
              <button 
                type="button"
                onClick={handlePrevMonth}
                className="border-2 border-black p-1 bg-white hover:bg-yellow-200 font-black cursor-pointer text-xs"
              >
                ◀
              </button>
              <span className="font-black uppercase text-xs">{monthYearLabel}</span>
              <button 
                type="button"
                onClick={handleNextMonth}
                className="border-2 border-black p-1 bg-white hover:bg-yellow-200 font-black cursor-pointer text-xs"
              >
                ▶
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-black text-[10px] uppercase mb-2 text-gray-500">
              {daysOfWeek.map(d => (
                <div key={d} className="p-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="p-2"></div>;
                }
                const active = isSelected(day);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`p-1.5 font-bold text-xs border transition-all cursor-pointer ${
                      active 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-transparent hover:border-black hover:bg-[#FF00FF] hover:text-white'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const CreateActivity = () => {
  const router = useRouter();
  const { user: teacherData } = useAuth();
  const queryClient = useQueryClient();
  
  const [evaluatingId, setEvaluatingId] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionsModal, setSubmissionsModal] = useState({ open: false, activity: null, data: null });
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classIds: [],
    dueDate: '',
    maxPoints: 100,
    type: 'Assessment',
    appointedTeacherId: '',
    questions: [{ id: Date.now(), title: '', type: 'text', weight: 0 }]
  });

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  // TanStack Query for data fetching
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['teacherClasses'],
    queryFn: getClasses,
    enabled: !!teacherData,
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ['teachersList'],
    queryFn: getTeachersList,
    enabled: !!teacherData,
  });

  const { data: activities = [], isLoading: listLoading, refetch: fetchActivitiesList } = useQuery({
    queryKey: ['teacherActivities'],
    queryFn: () => getActivities(),
    enabled: !!teacherData,
  });

  const loading = classesLoading || teachersLoading;

  // Mutations
  const createActivityMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherActivities'] });
      setStatus('success');
      setFormData({
        title: '',
        description: '',
        classIds: [],
        dueDate: '',
        maxPoints: 100,
        type: 'Assessment',
        appointedTeacherId: '',
        questions: [{ id: Date.now(), title: '', type: 'text', weight: 0 }]
      });
      setTimeout(() => setStatus('idle'), 2000);
    },
    onError: (err) => {
      setStatus('error');
      setError(err.message || 'Failed to deploy activity');
      setTimeout(() => setStatus('idle'), 3000);
    }
  });

  const deleteActivityMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherActivities'] });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    },
    onError: (err) => {
      setStatus('error');
      setError(err.message || 'Failed to delete activity');
      setTimeout(() => setStatus('idle'), 3000);
    }
  });

  const uploadMarksMutation = useMutation({
    mutationFn: ({ activityId, file }) => uploadActivityMarks(activityId, file),
    onSuccess: (data, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: ['teacherActivities'] });
      setStatus('success');
      handleViewSubmissions(activityId);
      setTimeout(() => setStatus('idle'), 3000);
    },
    onError: (err) => {
      setError(err.message || 'Failed to upload marks');
      setStatus('error');
    }
  });

  const editMarksMutation = useMutation({
    mutationFn: ({ activityId, submissionId, updateData }) => editActivityMarks(activityId, submissionId, updateData),
    onSuccess: (data, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: ['teacherActivities'] });
      setStatus('success');
      handleViewSubmissions(activityId);
      setEditingSubmission(null);
      setTimeout(() => setStatus('idle'), 2000);
    },
    onError: (err) => {
      setStatus('error');
      setError(err.message || 'Failed to edit marks');
    }
  });

  const handleClassToggle = (classId) => {
    setFormData(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId]
    }));
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { id: Date.now(), title: '', type: 'text', weight: 0 }]
    });
  };

  const handleRemoveQuestion = (id) => {
    const newQuestions = formData.questions.filter(q => q.id !== id);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleQuestionChange = (id, field, value) => {
    const newQuestions = formData.questions.map(q => 
      q.id === id ? { ...q, [field]: field === 'weight' ? Number(value) : value } : q
    );
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const totalWeight = formData.questions.reduce((sum, q) => sum + (q.weight || 0), 0);
    if (Number(totalWeight) !== Number(formData.maxPoints) && formData.questions.length > 0) {
      setError(`Total criteria points must equal Max Points (${formData.maxPoints})`);
      return;
    }

    if (formData.classIds.length === 0) {
      setError('Select at least one class');
      return;
    }

    setError('');
    
    const submissionData = {
      ...formData,
      rubrics: formData.questions.map(q => ({ criteria: q.title, weight: q.weight }))
    };
    createActivityMutation.mutate(submissionData);
  };

  const handleDownloadTemplate = async (activity) => {
    try {
      const blob = await downloadActivityTemplate(activity._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${activity.title.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleUploadMarks = (e, activityId) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadMarksMutation.mutate({ activityId, file });
    setEvaluatingId(null);
  };

  const handleViewSubmissions = async (activityId) => {
    try {
      setSubmissionLoading(true);
      const activity = activities.find(a => a._id === activityId);
      const data = await getActivitySubmissions(activityId);
      setSubmissionsModal({ open: true, activity, data });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleStartEditing = (submission, rubrics) => {
    setEditingSubmission({ ...submission, rubrics });
    setEditFormData({
      criteriaMarks: { ...submission.criteriaMarks },
      feedback: submission.feedback
    });
  };

  const handleEditMarkChange = (criterion, value) => {
    setEditFormData(prev => ({
      ...prev,
      criteriaMarks: {
        ...prev.criteriaMarks,
        [criterion]: Number(value)
      }
    }));
  };

  const handleSaveEditedMarks = () => {
    if (!editingSubmission || !submissionsModal.data) return;
    editMarksMutation.mutate({
      activityId: submissionsModal.data.activity._id,
      submissionId: editingSubmission._id,
      updateData: editFormData
    });
  };

  const handleDeleteActivity = (activityId) => {
    if (!window.confirm('Delete this activity and all submissions?')) return;
    deleteActivityMutation.mutate(activityId);
  };

  const submitting = createActivityMutation.isPending;
  const uploadLoading = uploadMarksMutation.isPending;
  const editSaving = editMarksMutation.isPending;

  if (!teacherData) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full text-black">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 bg-gradient-to-r from-[#FFEB3B] to-[#FF00FF] border-8 border-black p-8 relative overflow-hidden text-black"
          style={{ boxShadow: '16px 16px 0px rgba(0,0,0,0.4)' }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#00FFFF] opacity-20 border-4 border-black rotate-45"></div>
          <div className="flex items-center gap-8 relative z-10">
            <div className="bg-white p-4 border-4 border-black text-black transform -rotate-3" style={{ boxShadow: '6px 6px 0px #000' }}>
              <ClipboardCheck size={48} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 leading-tight tracking-tighter text-black drop-shadow-lg">ACTIVITIES MANAGER</h2>
              <p className="text-sm font-black text-black uppercase tracking-widest bg-white inline-block px-3 py-1 border-2 border-black">Create & Track Soft Skill Assessments</p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col xl:flex-row gap-10">
          <div className="w-full xl:w-1/2 space-y-6">
            <h3 className="text-3xl font-black uppercase flex items-center gap-3 mb-6 bg-white border-6 border-black p-4 inline-block text-black" style={{ boxShadow: '6px 6px 0px #000' }}>
              <Zap size={32} className="text-[#FF00FF]" /> Create Activity
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5 text-black">
              <div className="bg-white border-6 border-black p-5" style={{ boxShadow: '8px 8px 0px #000' }}>
                <label className="block text-base font-black uppercase mb-2 text-[#000] flex items-center gap-2">
                  <Type size={20} /> Title *
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="E.G. SEMESTER PRESENTATION"
                  className="w-full border-4 border-black p-4 font-bold uppercase focus:bg-[#00FFFF] outline-none transition-all text-lg text-black"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="bg-white border-6 border-black p-5" style={{ boxShadow: '8px 8px 0px #000' }}>
                <label className="block text-base font-black uppercase mb-2 text-[#000] flex items-center gap-2">
                  <FileText size={20} /> Description *
                </label>
                <textarea 
                  required
                  rows="3"
                  placeholder="DESCRIBE THE TASK..."
                  className="w-full border-4 border-black p-4 font-bold focus:bg-[#00FF00] outline-none transition-all text-base text-black"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="bg-white border-6 border-black p-5" style={{ boxShadow: '8px 8px 0px #000' }}>
                <label className="block text-base font-black uppercase mb-2 text-[#000] flex items-center gap-2">
                  📋 Activity Type *
                </label>
                <select 
                  required
                  className="w-full border-4 border-black p-4 font-bold uppercase focus:bg-[#00FFFF] outline-none transition-all text-lg bg-white text-black"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value, appointedTeacherId: e.target.value === 'Interview' ? formData.appointedTeacherId : ''})}
                >
                  <option value="Assessment">Assessment</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Group Discussion">Group Discussion</option>
                  <option value="Role Play">Role Play</option>
                  <option value="Writing Task">Writing Task</option>
                  <option value="Interview">Interview</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.type === 'Interview' && (
                <div className="bg-white border-6 border-black p-5" style={{ boxShadow: '8px 8px 0px #000' }}>
                  <label className="block text-base font-black uppercase mb-2 text-[#000] flex items-center gap-2">
                    👤 Appoint Evaluator *
                  </label>
                  <select 
                    required
                    className="w-full border-4 border-black p-4 font-bold uppercase focus:bg-[#FF00FF] focus:text-white outline-none transition-all text-lg bg-white text-black"
                    value={formData.appointedTeacherId}
                    onChange={(e) => setFormData({...formData, appointedTeacherId: e.target.value})}
                  >
                    <option value="">-- SELECT TEACHER --</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.name.toUpperCase()} ({(Array.isArray(t.deptName) ? t.deptName.join(', ') : t.deptName) || 'DEPT'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-white border-6 border-black p-5" style={{ boxShadow: '8px 8px 0px #000' }}>
                <label className="block text-base font-black uppercase mb-4 text-[#000] flex items-center gap-2">
                  <Users size={20} /> Select Classes *
                </label>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                  {classes.map(cls => (
                    <label key={cls._id} className="flex items-center gap-4 cursor-pointer hover:bg-[#FFEB3B] p-3 transition-all border-2 border-transparent hover:border-black text-black">
                      <input 
                        type="checkbox"
                        checked={formData.classIds.includes(cls._id)}
                        onChange={() => handleClassToggle(cls._id)}
                        className="w-6 h-6 border-3 border-black accent-[#FF00FF]"
                      />
                      <div>
                        <p className="font-black text-lg">{cls.name}</p>
                        <p className="text-sm text-gray-600 font-bold">{cls.section}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {formData.classIds.length === 0 && <p className="text-red-600 font-black uppercase text-sm mt-3 flex items-center gap-2"><AlertCircle size={16} /> Select at least one</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border-6 border-black p-5" style={{ boxShadow: '8px 8px 0px #000' }}>
                  <label className="block text-sm font-black uppercase mb-2 text-[#000] flex items-center gap-2">
                    <Calendar size={18} /> Due Date *
                  </label>
                  <CustomDatePicker 
                    value={formData.dueDate}
                    onChange={(dateVal) => setFormData({...formData, dueDate: dateVal})}
                  />
                </div>
                <div className="bg-white border-6 border-black p-5" style={{ boxShadow: '8px 8px 0px #000' }}>
                  <label className="block text-sm font-black uppercase mb-2 text-[#000] flex items-center gap-2">
                    <Target size={18} /> Max Points *
                  </label>
                  <input 
                    required
                    type="number" 
                    className="w-full border-4 border-black p-4 font-bold focus:bg-[#00FFFF] outline-none transition-all text-lg text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={formData.maxPoints}
                    onChange={(e) => setFormData({...formData, maxPoints: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="bg-white border-6 border-black p-6" style={{ boxShadow: '8px 8px 0px #000' }}>
                <div className="flex justify-between items-center mb-6">
                  <label className="text-xl font-black uppercase flex items-center gap-2 text-[#000]">
                    📋 Evaluation Criteria
                  </label>
                  <button 
                    type="button"
                    onClick={handleAddQuestion}
                    className="bg-[#00FF00] border-4 border-black px-4 py-2 font-black uppercase text-sm flex items-center gap-2 hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer text-black"
                    style={{ boxShadow: '4px 4px 0px #000' }}
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {formData.questions.map((question, idx) => (
                    <motion.div 
                      key={question.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-[#F8F9FA] border-4 border-black p-4 hover:border-[#FF00FF] hover:bg-[#FFE5FF] transition-all text-black"
                    >
                       <div className="flex flex-col gap-3">
                          <div className="flex gap-3">
                            <span className="bg-black text-white w-10 h-10 flex items-center justify-center font-black text-lg shrink-0 rounded-sm">
                              {idx + 1}
                            </span>
                            <input 
                              type="text"
                              placeholder="Criterion (e.g., Communication)"
                              className="flex-1 border-b-4 border-black bg-transparent p-2 font-bold focus:outline-none focus:bg-[#00FFFF] text-black"
                              value={question.title}
                              onChange={(e) => handleQuestionChange(question.id, 'title', e.target.value)}
                            />
                          </div>
                          <div className="flex items-center justify-between pl-12">
                            <div className="flex items-center gap-3">
                              <label className="text-xs font-black uppercase">Points</label>
                              <div className="flex items-center border-3 border-black bg-white">
                                <input 
                                  type="number"
                                  placeholder="0"
                                  className="w-16 p-2 font-black text-center outline-none text-lg text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  value={question.weight}
                                  onChange={(e) => handleQuestionChange(question.id, 'weight', e.target.value)}
                                />
                                <span className="px-3 font-black border-l-3 border-black bg-[#FFEB3B] text-lg text-black">PTS</span>
                              </div>
                            </div>

                            <button 
                              type="button"
                              onClick={() => handleRemoveQuestion(question.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 transition-all font-black cursor-pointer"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                       </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-black text-white flex justify-between items-center font-black text-lg border-4 border-white">
                  <span className="uppercase text-sm">Total Allocation</span>
                  <span className={`text-2xl ${
                    formData.questions.reduce((sum, q) => sum + (q.weight || 0), 0) === Number(formData.maxPoints) 
                      ? 'text-[#00FF00]' 
                      : 'text-[#FF0000]'
                  }`}>
                    {formData.questions.reduce((sum, q) => sum + (q.weight || 0), 0)} / {formData.maxPoints} PTS
                  </span>
                </div>
                {error && <p className="mt-4 text-red-600 font-black uppercase text-sm bg-red-100 p-2 border-2 border-red-600">⚠️ {error}</p>}
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white border-6 border-black p-6 text-xl font-black uppercase flex items-center justify-center gap-3 hover:bg-[#FF00FF] active:scale-95 transition-all cursor-pointer"
                style={{ boxShadow: '8px 8px 0px #00FFFF' }}
              >
                {submitting ? <Loader2 className="animate-spin" size={24} /> : '🚀 Deploy'} <ArrowRight size={28} />
              </button>
            </form>
          </div>

          <div className="w-full xl:w-1/2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-3xl font-black uppercase flex items-center gap-3 bg-[#00FF00] border-6 border-black p-4 inline-block text-black" style={{ boxShadow: '6px 6px 0px #000' }}>
                <FolderOpen size={32} className="text-black" /> Activities
              </h3>
              <button 
                type="button"
                onClick={() => fetchActivitiesList()}
                disabled={listLoading}
                className="bg-[#00FFFF] border-4 border-black p-3 font-black uppercase text-sm flex items-center gap-2 hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer self-start sm:self-auto text-black"
                style={{ boxShadow: '4px 4px 0px #000' }}
                title="Refresh Activities"
              >
                <RefreshCw className={`w-5 h-5 ${listLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="space-y-4">
              {listLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div 
                      key={n} 
                      className="bg-white border-6 border-black p-6 animate-pulse"
                      style={{ boxShadow: '8px 8px 0px #000' }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="h-7 bg-gray-300 w-2/3 border-2 border-black"></div>
                        <div className="h-6 bg-gray-300 w-16 border-2 border-black"></div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-200 w-full border border-black"></div>
                        <div className="h-4 bg-gray-200 w-5/6 border border-black"></div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="h-6 bg-gray-200 w-24 border-2 border-black"></div>
                        <div className="h-6 bg-gray-200 w-20 border-2 border-black"></div>
                        <div className="h-6 bg-gray-200 w-16 border-2 border-black"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="bg-white border-6 border-black p-12 text-center text-black" style={{ boxShadow: '8px 8px 0px #000' }}>
                  <p className="font-bold text-gray-600 uppercase text-lg">📭 No activities yet</p>
                </div>
              ) : (
                activities.map((activity, idx) => (
                  <motion.div 
                    key={activity._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border-6 border-black p-6 hover:shadow-2xl transition-all group relative text-black"
                    style={{ boxShadow: '8px 8px 0px #000' }}
                  >
                    <div className="flex justify-between items-start mb-3 text-black">
                      <h4 className="text-2xl font-black uppercase flex-1 pr-3">{activity.title}</h4>
                      <span className={`text-xs font-black uppercase px-3 py-1 border-2 border-black whitespace-nowrap text-black ${
                        activity.status === 'Active' ? 'bg-[#00FF00]' : 'bg-gray-400'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                    
                    <p className="text-sm font-bold text-gray-700 line-clamp-2 mb-4">{activity.description}</p>
                    
                    <div className="flex flex-wrap gap-2 text-xs font-black uppercase mb-5">
                      <span className="bg-[#FF00FF] text-white border-2 border-black px-3 py-1 flex items-center gap-1 font-bold">
                        🏷️ {activity.type || 'Assessment'}
                      </span>
                      <span className="bg-[#00FFFF] border-2 border-black px-3 py-1 flex items-center gap-1 font-bold text-black">
                        📚 {activity.classIds?.map(c => c.name).join(', ') || 'Classes'}
                      </span>
                      <span className="bg-[#FFEB3B] border-2 border-black px-3 py-1 flex items-center gap-1 font-bold text-black">
                        📅 {new Date(activity.dueDate).toLocaleDateString()}
                      </span>
                      <span className="bg-black text-white border-2 border-black px-3 py-1 font-bold">
                        ⭐ {activity.maxPoints} pts
                      </span>
                      {activity.appointedTeacherId && (
                        <span className={`${teacherData && activity.appointedTeacherId._id === teacherData._id ? 'bg-[#00FF00] text-black' : 'bg-yellow-200 text-black'} border-2 border-black px-3 py-1 font-bold`}>
                          {teacherData && activity.appointedTeacherId._id === teacherData._id 
                            ? `🎯 Evaluator (Assigned by ${activity.teacherId?.name || 'Teacher'})` 
                            : `👤 Appointed: ${activity.appointedTeacherId.name}`
                          }
                        </span>
                      )}
                    </div>

                    <div className="mt-5 pt-5 border-t-4 border-black flex gap-2 flex-wrap text-black">
                      <button 
                        onClick={() => handleDownloadTemplate(activity)}
                        className="flex-1 min-w-24 bg-white border-4 border-black p-3 font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#FFEB3B] active:scale-95 transition-all cursor-pointer text-black"
                        style={{ boxShadow: '4px 4px 0px #000' }}
                      >
                        <Download size={16} /> Template
                      </button>
                      <button 
                        onClick={() => handleViewSubmissions(activity._id)}
                        className="flex-1 min-w-24 bg-[#00FF00] border-4 border-black p-3 font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#00FFFF] active:scale-95 transition-all cursor-pointer text-black"
                        style={{ boxShadow: '4px 4px 0px #000' }}
                      >
                        <Eye size={16} /> View
                      </button>
                      <button 
                        onClick={() => setEvaluatingId(evaluatingId === activity._id ? null : activity._id)}
                        className="flex-1 min-w-24 bg-black text-white border-4 border-black p-3 font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#FF00FF] active:scale-95 transition-all cursor-pointer"
                        style={{ boxShadow: '4px 4px 0px #000' }}
                      >
                        <Upload size={16} /> Upload
                      </button>
                    </div>

                    <AnimatePresence>
                      {evaluatingId === activity._id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="bg-[#00FF00] border-4 border-black p-5 text-black">
                            <p className="text-xs font-black uppercase mb-3">⬆️ Upload CSV:</p>
                            <div className="relative">
                              <input 
                                type="file" 
                                accept=".csv"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => handleUploadMarks(e, activity._id)}
                              />
                              <div className="bg-white border-3 border-dashed border-black p-4 text-center pointer-events-none cursor-pointer hover:bg-yellow-50">
                                {uploadLoading ? <Loader2 className="animate-spin mx-auto text-[#FF00FF]" size={24} /> : <Upload className="mx-auto text-black" size={24} />}
                                <span className="text-xs font-bold block mt-2">Click or drop CSV file</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {(!activity.teacherId || (teacherData && (activity.teacherId._id === teacherData._id || activity.teacherId === teacherData._id))) && (
                      <button 
                        onClick={() => handleDeleteActivity(activity._id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-600 hover:bg-red-100 p-2 opacity-0 group-hover:opacity-100 transition-all font-black cursor-pointer border-none"
                      >
                        <Trash2 size={22} />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Submissions Modal */}
        <AnimatePresence>
          {submissionsModal.open && submissionsModal.data && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSubmissionsModal({ open: false, activity: null, data: null })}
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                className="bg-white border-8 border-black max-w-5xl w-full max-h-[92vh] overflow-y-auto text-black"
                style={{ boxShadow: '20px 20px 0px rgba(0,0,0,0.5)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-gradient-to-r from-[#FFEB3B] to-[#00FFFF] border-b-8 border-black p-6 flex justify-between items-center text-black z-10">
                  <h3 className="text-3xl font-black uppercase">{submissionsModal.data.activity.title}</h3>
                  <button 
                    onClick={() => setSubmissionsModal({ open: false, activity: null, data: null })}
                    className="bg-black text-white p-3 hover:bg-red-600 border-2 border-white font-black transition-all cursor-pointer"
                  >
                    <X size={28} />
                  </button>
                </div>

                {editingSubmission ? (
                  <div className="p-8 space-y-6 text-black">
                    <div className="bg-gradient-to-r from-[#FFEB3B] to-[#00FFFF] border-6 border-black p-6 text-black">
                      <h4 className="text-4xl font-black uppercase mb-2">{editingSubmission.studentName}</h4>
                      <p className="text-base font-bold text-gray-800 flex gap-4">
                        <span>🆔 {editingSubmission.rollNo}</span>
                        <span>📧 {editingSubmission.email}</span>
                      </p>
                    </div>
                    
                    <div className="bg-white border-6 border-black p-6 space-y-5">
                      <div>
                        <label className="block font-black uppercase text-2xl mb-6 flex items-center gap-2 text-[#FF00FF]">
                          ✏️ EDIT MARKS
                        </label>
                        
                        <div className="border-6 border-black bg-white overflow-hidden text-black">
                          <div className="bg-black text-white border-b-4 border-black flex font-black uppercase text-sm">
                            <div className="flex-1 p-4 border-r-4 border-white">Criterion</div>
                            <div className="w-32 p-4 text-center">Marks</div>
                          </div>
                          
                          <div className="divide-y-3 divide-black">
                            {editingSubmission.rubrics.map((criterion) => (
                              <div key={criterion} className="flex items-center hover:bg-[#FFFACD] transition-all">
                                <div className="flex-1 p-4 border-r-2 border-gray-300 font-bold">{criterion}</div>
                                <div className="w-32 p-4">
                                  <input 
                                    type="number"
                                    value={editFormData.criteriaMarks?.[criterion] || 0}
                                    onChange={(e) => handleEditMarkChange(criterion, e.target.value)}
                                    className="w-full border-4 border-black p-2 font-black text-lg text-center focus:bg-[#00FFFF] focus:text-black outline-none text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-black text-white border-4 border-white p-4 flex justify-between items-center font-black text-lg">
                        <span className="uppercase">Total Score</span>
                        <span className="bg-[#FF00FF] px-6 py-2 text-2xl text-white">
                          {Object.values(editFormData.criteriaMarks || {}).reduce((a, b) => a + b, 0)}/{submissionsModal.data.activity.maxPoints}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border-6 border-black p-6">
                      <label className="block font-black uppercase text-lg mb-4 flex items-center gap-2 text-[#00FFFF]">
                        💬 FEEDBACK
                      </label>
                      <textarea 
                        rows="5"
                        value={editFormData.feedback || ''}
                        onChange={(e) => setEditFormData({...editFormData, feedback: e.target.value})}
                        className="w-full border-4 border-black p-4 font-bold text-base focus:bg-[#00FF00] focus:text-black outline-none transition-all text-black"
                        placeholder="Add feedback for the student..."
                      />
                    </div>

                    {editingSubmission.editHistory && editingSubmission.editHistory.length > 0 && (
                      <div className="border-6 border-black p-6 bg-white text-black">
                        <h5 className="font-black uppercase text-2xl mb-6 flex items-center gap-2 text-[#FF00FF]">
                          <History size={28} /> EDIT HISTORY
                        </h5>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                          {editingSubmission.editHistory.map((edit, idx) => (
                            <div key={idx} className="border-l-6 border-[#FF00FF] bg-[#F8F9FA] p-4 border-4 border-black">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-black text-lg text-[#FF00FF]">👤 {edit.editedByTeacherName}</p>
                                  <p className="text-sm text-gray-600 font-bold">🕐 {new Date(edit.editedAt).toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="mt-3 space-y-2">
                                {Object.entries(edit.changes || {}).map(([key, val]) => (
                                  <div key={key} className="bg-[#FFEB3B] p-2 border-2 border-black font-bold text-sm text-black">
                                    <span className="font-black">{key}:</span> 
                                    <span className="line-through text-red-600"> {val.oldValue}</span>
                                    <span className="text-green-600 font-black"> → {val.newValue}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button 
                        onClick={handleSaveEditedMarks}
                        disabled={editSaving}
                        className="flex-1 bg-[#00FF00] border-6 border-black p-4 font-black uppercase text-lg flex items-center justify-center gap-3 hover:shadow-lg active:scale-95 transition-all cursor-pointer text-black"
                        style={{ boxShadow: '6px 6px 0px #000' }}
                      >
                        {editSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} SAVE
                      </button>
                      <button 
                        onClick={() => setEditingSubmission(null)}
                        className="flex-1 bg-black text-white border-6 border-black p-4 font-black uppercase text-lg hover:bg-red-600 active:scale-95 transition-all cursor-pointer"
                        style={{ boxShadow: '6px 6px 0px #000' }}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-0 overflow-x-auto text-black">
                    <div className="bg-black text-white border-b-8 border-black flex items-center font-black uppercase text-sm sticky top-0">
                      <div className="flex-1 min-w-32 p-6 border-r-4 border-white">ROLL NO</div>
                      <div className="flex-1 min-w-40 p-6 border-r-4 border-white">NAME</div>
                      <div className="flex-1 min-w-48 p-6 border-r-4 border-white">EMAIL</div>
                      <div className="w-32 min-w-32 p-6 border-r-4 border-white text-center">MARKS</div>
                      <div className="w-40 min-w-40 p-6 text-center">ACTION</div>
                    </div>

                    <div className="bg-white divide-y-4 divide-black">
                      {submissionsModal.data.submissions.map((sub, idx) => (
                        <motion.div 
                          key={sub._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center border-b-2 border-black hover:bg-[#FFFACD] transition-all bg-white group"
                        >
                          <div className="flex-1 min-w-32 p-6 border-r-2 border-gray-300 font-black text-lg">{sub.rollNo}</div>
                          
                          <div className="flex-1 min-w-40 p-6 border-r-2 border-gray-300">
                            <p className="font-black text-lg">{sub.studentName}</p>
                          </div>
                          
                          <div className="flex-1 min-w-48 p-6 border-r-2 border-gray-300">
                            <p className="font-bold text-gray-700">{sub.email}</p>
                          </div>
                          
                          <div className="w-32 min-w-32 p-6 border-r-2 border-gray-300 text-center">
                            <div className="bg-[#FF00FF] text-white px-3 py-1 border-3 border-black font-black text-lg inline-block">
                              {sub.totalMarks}/{submissionsModal.data.activity.maxPoints}
                            </div>
                          </div>

                          <div className="w-40 min-w-40 p-6 flex gap-2 justify-center">
                            <button 
                              onClick={() => handleStartEditing(sub, submissionsModal.data.rubrics)}
                              className="bg-[#00FFFF] border-3 border-black px-3 py-2 text-xs font-black uppercase hover:bg-[#FF00FF] hover:text-white active:scale-90 transition-all cursor-pointer text-black"
                              style={{ boxShadow: '3px 3px 0px #000' }}
                              title="View and edit marks"
                            >
                              ✏️ VIEW
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {submissionsModal.data.submissions.length === 0 && (
                      <div className="p-12 text-center bg-white border-4 border-black">
                        <p className="font-black text-xl text-gray-500">📭 No submissions yet</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.7, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 50 }}
              className="fixed bottom-8 right-8 z-[100]"
            >
              <div className={`${status === 'success' ? 'bg-[#00FF00]' : 'bg-[#FF0000]'} border-6 border-black p-6 flex items-center gap-4 text-black font-black`} style={{ boxShadow: '10px 10px 0px rgba(0,0,0,0.4)' }}>
                {status === 'success' ? <CheckCircle2 size={36} /> : <AlertCircle size={36} className="text-white" />}
                <div className={status === 'success' ? 'text-black' : 'text-white'}>
                  <h4 className="font-black uppercase text-base">{status === 'success' ? '✓ Success!' : '✗ Error'}</h4>
                  <p className="text-xs font-bold">{status === 'success' ? 'Operation completed' : error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default CreateActivity;
