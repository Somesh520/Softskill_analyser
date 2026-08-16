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
import { useToast } from '../../../context/ToastContext';

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
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-background border border-border rounded-xl shadow-sm p-3.5 font-medium flex justify-between items-center hover:border-primary/50 transition-colors text-left text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <span className="flex items-center gap-2">
          <Calendar size={18} className="text-foreground/50"/>
          {displayValue}
        </span>
        <ChevronDown className={`w-5 h-5 text-foreground/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

          <div
            className="absolute top-full mt-2 left-0 bg-card border border-border rounded-xl shadow-lg p-4 z-50 w-72 text-foreground"
          >
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="hover:bg-foreground/5 rounded-lg p-1.5 transition-colors cursor-pointer text-foreground/70"
              >
                ◀
              </button>
              <span className="font-semibold text-sm">{monthYearLabel}</span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="hover:bg-foreground/5 rounded-lg p-1.5 transition-colors cursor-pointer text-foreground/70"
              >
                ▶
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[10px] uppercase tracking-wider mb-2 text-foreground/50">
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
                    className={`p-1.5 font-medium text-sm rounded-lg transition-colors cursor-pointer ${active
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-foreground/5 text-foreground'
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
  const { showConfirm } = useToast();

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
    enabled: !!teacherData });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ['teachersList'],
    queryFn: getTeachersList,
    enabled: !!teacherData });

  const { data: activities = [], isLoading: listLoading, refetch: fetchActivitiesList } = useQuery({
    queryKey: ['teacherActivities'],
    queryFn: () => getActivities(),
    enabled: !!teacherData });

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
      q.id === id ? { ...q, [field]: field === 'weight' ? (value === '' ? '' : Number(value)) : value } : q
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

  const handleDeleteActivity = async (activityId) => {
    const confirmed = await showConfirm('Delete this activity and all its submissions?');
    if (!confirmed) return;
    deleteActivityMutation.mutate(activityId);
  };

  const submitting = createActivityMutation.isPending;
  const uploadLoading = uploadMarksMutation.isPending;
  const editSaving = editMarksMutation.isPending;

  if (!teacherData) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-card border border-border rounded-2xl shadow-sm p-8 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl text-primary" >
              <ClipboardCheck size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">Activities Manager</h2>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 border border-primary/10 rounded-md">
                Create & Track Soft Skill Assessments
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col xl:flex-row gap-8">
          <div className="w-full xl:w-1/2 space-y-6">
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 mb-6">
              <Zap size={24} className="text-primary" /> Create Activity
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-card border border-border rounded-2xl shadow-sm p-6" >
                <label className="block text-sm font-semibold text-foreground/80 mb-2 flex items-center gap-2">
                  <Type size={16} /> Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Semester Presentation"
                  className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors text-foreground placeholder:text-foreground/40"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="bg-card border border-border rounded-2xl shadow-sm p-6" >
                <label className="block text-sm font-semibold text-foreground/80 mb-2 flex items-center gap-2">
                  <FileText size={16} /> Description *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe the task..."
                  className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors text-foreground placeholder:text-foreground/40 resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="bg-card border border-border rounded-2xl shadow-sm p-6" >
                <label className="block text-sm font-semibold text-foreground/80 mb-2 flex items-center gap-2">
                  <ClipboardCheck size={16} /> Activity Type *
                </label>
                <select
                  required
                  className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors text-foreground cursor-pointer"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, appointedTeacherId: e.target.value === 'Interview' ? formData.appointedTeacherId : '' })}
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
                <div className="bg-card border border-border rounded-2xl shadow-sm p-6" >
                  <label className="block text-sm font-semibold text-foreground/80 mb-2 flex items-center gap-2">
                    <Users size={16} /> Appoint Evaluator *
                  </label>
                  <select
                    required
                    className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors text-foreground cursor-pointer"
                    value={formData.appointedTeacherId}
                    onChange={(e) => setFormData({ ...formData, appointedTeacherId: e.target.value })}
                  >
                    <option value="">-- Select Teacher --</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({(Array.isArray(t.deptName) ? t.deptName.join(', ') : t.deptName) || 'Dept'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-card border border-border rounded-2xl shadow-sm p-6" >
                <label className="block text-sm font-semibold text-foreground/80 mb-4 flex items-center gap-2">
                  <Users size={16} /> Select Classes *
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                  {classes.map(cls => (
                    <label key={cls._id} className={`flex items-center gap-4 cursor-pointer p-3 rounded-xl transition-colors border ${formData.classIds.includes(cls._id) ? 'bg-primary/5 border-primary shadow-sm' : 'bg-background border-border hover:border-primary/50'}`}>
                      <input
                        type="checkbox"
                        checked={formData.classIds.includes(cls._id)}
                        onChange={() => handleClassToggle(cls._id)}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50 cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{cls.name}</p>
                        <p className="text-xs font-medium text-foreground/60">{cls.section}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {formData.classIds.length === 0 && <p className="text-red-500 font-medium text-sm mt-3 flex items-center gap-2"><AlertCircle size={14} /> Select at least one</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-card border border-border rounded-2xl shadow-sm p-6" >
                  <label className="block text-sm font-semibold text-foreground/80 mb-2 flex items-center gap-2">
                    <Calendar size={16} /> Due Date *
                  </label>
                  <CustomDatePicker
                    value={formData.dueDate}
                    onChange={(dateVal) => setFormData({ ...formData, dueDate: dateVal })}
                  />
                </div>
                <div className="bg-card border border-border rounded-2xl shadow-sm p-6" >
                  <label className="block text-sm font-semibold text-foreground/80 mb-2 flex items-center gap-2">
                    <Target size={16} /> Max Points *
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full bg-background border border-border rounded-xl shadow-sm px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={formData.maxPoints}
                    onChange={(e) => setFormData({ ...formData, maxPoints: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl shadow-sm p-6" >
                <div className="flex justify-between items-center mb-6">
                  <label className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <ClipboardCheck size={20} className="text-primary"/> Evaluation Criteria
                  </label>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="bg-primary/10 text-primary border border-primary/20 rounded-lg px-3 py-1.5 font-semibold text-sm flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {formData.questions.map((question, idx) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-background border border-border rounded-xl p-4 flex flex-col gap-3 group"
                    >
                      <div className="flex gap-3">
                        <span className="bg-foreground/5 text-foreground/50 w-8 h-8 flex items-center justify-center font-bold text-sm rounded-lg shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Criterion (e.g., Communication)"
                          className="flex-1 bg-transparent border-b border-border/50 pb-1 font-medium focus:outline-none focus:border-primary text-foreground placeholder:text-foreground/40"
                          value={question.title}
                          onChange={(e) => handleQuestionChange(question.id, 'title', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between pl-11">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-semibold uppercase text-foreground/50">Points</label>
                          <div className="flex items-center bg-card border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/50">
                            <input
                              type="number"
                              placeholder="0"
                              className="w-16 p-2 font-semibold text-center outline-none bg-transparent text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={question.weight}
                              onChange={(e) => handleQuestionChange(question.id, 'weight', e.target.value)}
                            />
                            <span className="px-2 font-semibold text-foreground/50 text-xs bg-foreground/5 border-l border-border h-full flex items-center">PTS</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="text-foreground/40 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-foreground/5 rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-sm text-foreground/70 uppercase">Total Allocation</span>
                  <span className={`text-lg font-bold ${formData.questions.reduce((sum, q) => sum + (q.weight || 0), 0) === Number(formData.maxPoints)
                    ? 'text-green-500'
                    : 'text-red-500'
                    }`}>
                    {formData.questions.reduce((sum, q) => sum + (q.weight || 0), 0)} / {formData.maxPoints} pts
                  </span>
                </div>
                {error && <p className="mt-4 text-red-500 font-medium text-sm bg-red-500/10 p-3 rounded-lg flex items-center gap-2"><AlertCircle size={16}/> {error}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-primary text-primary-foreground font-bold text-lg rounded-xl shadow-md py-4 mt-6 flex justify-center items-center gap-2 transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Deploy Activity'} <ArrowRight size={20} />
              </button>
            </form>
          </div>

          <div className="w-full xl:w-1/2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FolderOpen size={24} className="text-primary"/> Activities
              </h3>
              <button
                type="button"
                onClick={() => fetchActivitiesList()}
                disabled={listLoading}
                className="bg-card border border-border rounded-xl shadow-sm px-4 py-2 font-semibold text-sm flex items-center gap-2 hover:bg-foreground/5 transition-colors cursor-pointer text-foreground/80 hover:text-foreground"
                title="Refresh Activities"
              >
                <RefreshCw className={`w-4 h-4 ${listLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="space-y-4">
              {listLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-pulse"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-6 bg-foreground/10 rounded w-2/3"></div>
                        <div className="h-5 bg-foreground/10 rounded-full w-16"></div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="h-3 bg-foreground/5 rounded w-full"></div>
                        <div className="h-3 bg-foreground/5 rounded w-5/6"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-foreground/10 rounded-md w-20"></div>
                        <div className="h-6 bg-foreground/10 rounded-md w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center" >
                  <FolderOpen size={48} className="mx-auto text-foreground/20 mb-4" />
                  <p className="font-semibold text-foreground/50 text-lg">No activities yet</p>
                </div>
              ) : (
                activities.map((activity, idx) => (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    className="bg-card border border-border rounded-2xl shadow-sm p-6 hover:border-primary/30 transition-colors group relative"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-bold text-foreground flex-1 pr-4">{activity.title}</h4>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${activity.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-foreground/60'
                        }`}>
                        {activity.status}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-foreground/70 line-clamp-2 mb-4">{activity.description}</p>

                    <div className="flex flex-wrap gap-2 text-xs font-semibold mb-5">
                      <span className="bg-primary/10 text-primary border border-primary/20 rounded-md px-2.5 py-1 flex items-center gap-1.5">
                        <Type size={14} /> {activity.type || 'Assessment'}
                      </span>
                      <span className="bg-foreground/5 text-foreground/80 rounded-md px-2.5 py-1 flex items-center gap-1.5">
                        <Users size={14} /> {activity.classIds?.map(c => c.name).join(', ') || 'Classes'}
                      </span>
                      <span className="bg-foreground/5 text-foreground/80 rounded-md px-2.5 py-1 flex items-center gap-1.5">
                        <Calendar size={14} /> {new Date(activity.dueDate).toLocaleDateString()}
                      </span>
                      <span className="bg-foreground/5 text-foreground/80 rounded-md px-2.5 py-1 flex items-center gap-1.5">
                        <Target size={14} /> {activity.maxPoints} pts
                      </span>
                      {activity.appointedTeacherId && (
                        <span className={`${teacherData && activity.appointedTeacherId._id === teacherData._id ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'} rounded-md px-2.5 py-1 flex items-center gap-1.5`}>
                          <Users size={14} />
                          {teacherData && activity.appointedTeacherId._id === teacherData._id
                            ? `Evaluator (by ${activity.teacherId?.name || 'Teacher'})`
                            : `Appointed: ${activity.appointedTeacherId.name}`
                          }
                        </span>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-border/50 flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleDownloadTemplate(activity)}
                        className="flex-1 bg-background border border-border rounded-xl p-2.5 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-foreground/5 transition-colors cursor-pointer text-foreground/80 hover:text-foreground"
                      >
                        <Download size={16} /> Template
                      </button>
                      <button
                        onClick={() => handleViewSubmissions(activity._id)}
                        className="flex-1 bg-background border border-border rounded-xl p-2.5 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-foreground/5 transition-colors cursor-pointer text-foreground/80 hover:text-foreground"
                      >
                        <Eye size={16} /> View
                      </button>
                      <button
                        onClick={() => setEvaluatingId(evaluatingId === activity._id ? null : activity._id)}
                        className="flex-1 bg-primary/10 text-primary border border-primary/20 rounded-xl p-2.5 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
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
                          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Upload CSV Marks:</p>
                            <div className="relative">
                              <input
                                type="file"
                                accept=".csv"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => handleUploadMarks(e, activity._id)}
                              />
                              <div className="bg-background border-2 border-dashed border-primary/30 rounded-xl p-6 text-center pointer-events-none hover:bg-primary/5 transition-colors">
                                {uploadLoading ? <Loader2 className="animate-spin mx-auto text-primary" size={24} /> : <Upload className="mx-auto text-primary/70" size={24} />}
                                <span className="text-xs font-semibold text-foreground/70 block mt-2">Click or drop CSV file</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {(!activity.teacherId || (teacherData && (activity.teacherId._id === teacherData._id || activity.teacherId === teacherData._id))) && (
                      <button
                        onClick={() => handleDeleteActivity(activity._id)}
                        className="absolute top-4 right-4 text-foreground/30 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Trash2 size={18} />
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
              className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSubmissionsModal({ open: false, activity: null, data: null })}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-border">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                      <Eye size={24} className="text-primary"/> Submissions
                    </h3>
                    <p className="text-sm font-medium text-foreground/60 mt-1">{submissionsModal.activity.title}</p>
                  </div>
                  <button
                    onClick={() => setSubmissionsModal({ open: false, activity: null, data: null })}
                    className="text-foreground/50 hover:text-foreground hover:bg-foreground/5 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-background rounded-b-2xl">
                  {submissionsModal.data.submissions.length === 0 ? (
                    <div className="text-center py-12 border border-border border-dashed rounded-xl">
                      <History size={48} className="mx-auto text-foreground/20 mb-4" />
                      <p className="font-semibold text-foreground/50 text-lg">No submissions yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {submissionsModal.data.submissions.map((sub, idx) => (
                        <div key={sub._id || idx} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                          <div className="bg-foreground/5 p-4 flex justify-between items-center border-b border-border">
                            <div>
                              <p className="font-bold text-foreground text-lg">{sub.studentId.name}</p>
                              <p className="text-xs font-medium text-foreground/60">{sub.studentId.rollNo}</p>
                            </div>
                            <div className="text-right flex items-center gap-4">
                              <div>
                                <span className="font-extrabold text-2xl text-primary">{sub.totalScore}</span>
                                <span className="text-sm font-medium text-foreground/50"> / {submissionsModal.activity.maxPoints}</span>
                              </div>
                              <button
                                onClick={() => handleStartEditing(sub, submissionsModal.data.rubrics)}
                                className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground p-2 rounded-lg transition-colors"
                                title="Edit Marks"
                              >
                                <Zap size={18} />
                              </button>
                            </div>
                          </div>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(sub.criteriaMarks).map(([criterion, mark]) => {
                               const rubric = submissionsModal.data.rubrics.find(r => r.criteria === criterion);
                               const max = rubric ? rubric.weight : '?';
                               return (
                                <div key={criterion} className="bg-background border border-border rounded-xl p-3 flex justify-between items-center">
                                  <span className="text-sm font-semibold text-foreground/80 line-clamp-1 flex-1 pr-2" title={criterion}>{criterion}</span>
                                  <span className="font-bold text-foreground bg-foreground/5 px-2 py-1 rounded-md text-sm shrink-0">{mark} / {max}</span>
                                </div>
                               );
                            })}
                          </div>
                          {sub.feedback && (
                            <div className="p-4 bg-background border-t border-border">
                              <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1">Feedback</p>
                              <p className="text-sm font-medium text-foreground/80">{sub.feedback}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Marks Modal */}
        <AnimatePresence>
          {editingSubmission && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setEditingSubmission(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-border bg-primary/5">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <Zap size={20} className="text-primary"/> Edit Marks
                    </h3>
                    <p className="text-sm font-medium text-foreground/60 mt-1">{editingSubmission.studentId.name}</p>
                  </div>
                  <button
                    onClick={() => setEditingSubmission(null)}
                    className="text-foreground/50 hover:text-foreground hover:bg-foreground/5 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                   <div className="space-y-4">
                     {editingSubmission.rubrics.map(rubric => (
                       <div key={rubric.criteria} className="space-y-1.5">
                         <div className="flex justify-between items-center text-sm font-semibold">
                           <span className="text-foreground/80">{rubric.criteria}</span>
                           <span className="text-foreground/50">Max: {rubric.weight}</span>
                         </div>
                         <input
                           type="number"
                           min="0"
                           max={rubric.weight}
                           className="w-full bg-background border border-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                           value={editFormData.criteriaMarks[rubric.criteria] || 0}
                           onChange={(e) => handleEditMarkChange(rubric.criteria, e.target.value)}
                         />
                       </div>
                     ))}
                     
                     <div className="space-y-1.5 pt-2">
                       <label className="text-sm font-semibold text-foreground/80">Feedback (Optional)</label>
                       <textarea
                         className="w-full bg-background border border-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-y"
                         rows="3"
                         value={editFormData.feedback || ''}
                         onChange={(e) => setEditFormData(prev => ({...prev, feedback: e.target.value}))}
                       />
                     </div>
                   </div>
                </div>
                
                <div className="p-6 border-t border-border flex gap-3 bg-background rounded-b-2xl">
                  <button
                    onClick={() => setEditingSubmission(null)}
                    className="flex-1 bg-card border border-border rounded-xl py-3 font-semibold text-sm hover:bg-foreground/5 transition-colors text-foreground"
                    disabled={editSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditedMarks}
                    className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    disabled={editSaving}
                  >
                    {editSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {editSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default CreateActivity;