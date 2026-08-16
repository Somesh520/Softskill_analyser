"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowLeft, BookOpen, Upload, FileText, Trash2, X, CheckCircle2, AlertCircle, Loader2, Briefcase, Download, FileDown } from 'lucide-react';
import { getClassDetails, uploadStudentCsv, deleteStudent, addStudentManually, updateStudentPlacement } from '../../../../api/teacherApi';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';

const ClassDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user: teacherData } = useAuth();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, processing, success, error
  const [uploadMessage, setUploadMessage] = useState('');

  const [studentToDelete, setStudentToDelete] = useState(null);
  const fileInputRef = React.useRef(null);
  const { showToast } = useToast();



  // Manual Add Student States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', rollNo: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Placement States
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [selectedStudentForPlacement, setSelectedStudentForPlacement] = useState(null);
  const [placementData, setPlacementData] = useState({ company: '', currentCompany: '', ctc: '', type: 'none' });
  const [placementLoading, setPlacementLoading] = useState(false);
  const [placementError, setPlacementError] = useState('');
  const [placementViewMode, setPlacementViewMode] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getClassDetails(id);
      setClassData(data.classDetails);
      setStudents(data.students || []);
    } catch (err) {
      setError(err.message || 'Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = 'name,email,rollNo';
    const sampleRows = [
      'John Doe,john.doe@kiet.edu,2100290100001',
      'Jane Smith,jane.smith@kiet.edu,2100290100002'
    ];
    const csvContent = [headers, ...sampleRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Student_Upload_Template_${classData?.name || 'Class'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showToast('Please select a valid CSV file.', 'warning');
      return;
    }

    try {
      setUploading(true);
      setUploadStatus('processing');
      setUploadMessage(`Analysing ${file.name}...`);
      setError('');

      const result = await uploadStudentCsv(id, file);

      setUploadStatus('success');
      setUploadMessage(result.message || 'Students successfully uploaded and assigned!');

      setTimeout(() => {
        setUploading(false);
        setUploadStatus('idle');
        fetchDetails();
      }, 2500);

    } catch (err) {
      setUploadStatus('error');
      setUploadMessage(err.message || 'Failed to upload students');
      setTimeout(() => {
        setUploading(false);
        setUploadStatus('idle');
      }, 3000);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteStudentClick = (student) => {
    setStudentToDelete(student);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(id, studentToDelete._id);
      fetchDetails(); // Refresh the list
      setStudentToDelete(null); // Close modal
    } catch (err) {
      showToast(err.message || 'Failed to delete student', 'error');
    }
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      setAddLoading(true);
      setAddError('');
      await addStudentManually(id, newStudent);
      setShowAddModal(false);
      setNewStudent({ name: '', email: '', rollNo: '' });
      fetchDetails(); // Refresh list
    } catch (err) {
      setAddError(err.message || 'Failed to add student');
    } finally {
      setAddLoading(false);
    }
  };

  const handlePlacementClick = (student) => {
    setSelectedStudentForPlacement(student);
    setPlacementData({
      company: student.placement?.company || '',
      currentCompany: student.placement?.currentCompany || '',
      ctc: student.placement?.ctc || '',
      type: student.placement?.type || 'none'
    });
    setPlacementError('');
    if (student.placement && student.placement.company) {
      setPlacementViewMode(true);
    } else {
      setPlacementViewMode(false);
    }
    setShowPlacementModal(true);
  };

  const handlePlacementSubmit = async (e) => {
    e.preventDefault();
    try {
      setPlacementLoading(true);
      setPlacementError('');
      await updateStudentPlacement(id, selectedStudentForPlacement._id, placementData);
      setShowPlacementModal(false);
      fetchDetails(); // Refresh list
    } catch (err) {
      setPlacementError(err.message || 'Failed to update placement');
    } finally {
      setPlacementLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!students || students.length === 0) {
      showToast('No students to download', 'info');
      return;
    }

    // Define the CSV headers
    const headers = ['Name', 'Email', 'Roll No', 'Semester', 'Placement Company', 'Current Company', 'CTC/LPA', 'Placement Type', 'Total Company Changes', 'Company History'];

    // Map student data to rows
    const csvRows = students.map(student => {
      const placement = student.placement || {};
      const history = student.placementHistory || [];
      const changesCount = history.length ? history.length : (placement.company ? 1 : 0);

      const historyString = history.map(h => `${h.currentCompany || h.company || 'Unknown'} (${h.ctc || 'N/A'})`).join(' -> ');

      return [
        `"${student.name || ''}"`,
        `"${student.email || ''}"`,
        `"${student.rollNo || ''}"`,
        `"${student.semester || ''}"`,
        `"${placement.company || ''}"`,
        `"${placement.currentCompany || ''}"`,
        `"${placement.ctc || ''}"`,
        `"${placement.type?.replace(/_/g, ' ') || 'none'}"`,
        `"${changesCount}"`,
        `"${historyString}"`
      ].join(',');
    });

    // Combine headers and rows
    const csvString = [headers.join(','), ...csvRows].join('\n');

    // Create Blob and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${classData?.name || 'Class'}_Placements.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!teacherData) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">

        <button
          onClick={() => router.push('/teacher/classes')}
          className="mb-6 flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors text-foreground/60 w-fit"
        >
          <ArrowLeft size={16} /> Back to Classes
        </button>

        {loading ? (
          <div className="w-full space-y-6 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-border rounded-full border-t-primary animate-spin mb-4" />
            <p className="font-semibold text-foreground/70">Loading Class Details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 text-red-500 p-6 border border-red-500/20 rounded-2xl shadow-sm font-semibold flex items-center gap-3">
            <AlertCircle size={24} /> {error}
          </div>
        ) : classData && (
          <>
            {/* Header Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-card border border-border rounded-2xl shadow-sm p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6">
                <div className="bg-primary/10 p-4 border border-primary/20 rounded-xl text-primary" >
                  <BookOpen size={40} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">{classData.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="font-semibold text-foreground/80 text-xs bg-foreground/5 px-2.5 py-1 rounded-md">
                      {classData.program} - {classData.branch}
                    </span>
                    <span className="font-semibold text-foreground/80 text-xs bg-foreground/5 px-2.5 py-1 rounded-md">
                      Sem {classData.semester}
                    </span>
                    <span className="font-semibold text-foreground/80 text-xs bg-foreground/5 px-2.5 py-1 rounded-md">
                      Sec {classData.section}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-primary text-primary-foreground p-4 rounded-xl shadow-sm flex flex-col items-center min-w-[120px]">
                <span className="text-3xl font-bold">{students.length}</span>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Students</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button
                className="bg-card border border-border rounded-xl shadow-sm px-5 py-2.5 font-semibold text-sm flex items-center gap-2 hover:bg-foreground/5 transition-colors cursor-pointer text-foreground"
                onClick={handleDownloadTemplate}
              >
                <FileDown size={18} /> Student Enroll Template
              </button>
              <button
                className={`bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground rounded-xl shadow-sm px-5 py-2.5 font-semibold text-sm flex items-center gap-2 transition-colors ${uploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                onClick={() => !uploading && fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={18} /> {uploading ? 'Processing CSV...' : 'Upload Student CSV'}
              </button>
              <button
                className="bg-card border border-border rounded-xl shadow-sm px-5 py-2.5 font-semibold text-sm flex items-center gap-2 hover:bg-foreground/5 transition-colors cursor-pointer text-foreground"
                onClick={() => showToast('Evaluation functionality coming next!', 'info')}
              >
                <FileText size={18} /> Evaluate Class
              </button>
              <button
                className="bg-card border border-border rounded-xl shadow-sm px-5 py-2.5 font-semibold text-sm flex items-center gap-2 hover:bg-foreground/5 transition-colors cursor-pointer text-foreground"
                onClick={() => {
                  setAddError('');
                  setShowAddModal(true);
                }}
              >
                <Users size={18} /> Add Student Manually
              </button>
              <button
                className="bg-card border border-border rounded-xl shadow-sm px-5 py-2.5 font-semibold text-sm flex items-center gap-2 hover:bg-foreground/5 transition-colors cursor-pointer text-foreground ml-auto"
                onClick={handleDownloadCSV}
              >
                <Download size={18} /> Placements CSV
              </button>
            </div>

            {/* Upload Animation Overlay */}
            <AnimatePresence>
              {uploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl shadow-xl p-8 max-w-sm w-full text-center"
                  >
                    <div className="flex justify-center mb-6">
                      {uploadStatus === 'processing' && (
                        <div className="relative">
                          <Loader2 size={48} className="animate-spin text-primary" />
                        </div>
                      )}
                      {uploadStatus === 'success' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-500 bg-green-500/10 p-4 rounded-full"
                        >
                          <CheckCircle2 size={48} />
                        </motion.div>
                      )}
                      {uploadStatus === 'error' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-red-500 bg-red-500/10 p-4 rounded-full"
                        >
                          <AlertCircle size={48} />
                        </motion.div>
                      )}
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
                      {uploadStatus === 'processing' ? 'Syncing Students' :
                        uploadStatus === 'success' ? 'Records Secured' : 'Upload Failed'}
                    </h2>

                    <p className="text-sm font-medium text-foreground/70">
                      {uploadMessage}
                    </p>

                    {uploadStatus === 'processing' && (
                      <div className="mt-6 h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="h-full w-1/3 bg-primary rounded-full"
                        />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Student List */}
            <div className="bg-card border border-border rounded-2xl shadow-sm p-6" >
              <h3 className="text-xl font-bold tracking-tight text-foreground mb-6 flex items-center gap-2">
                <Users size={24} className="text-primary" /> Enrolled Students
              </h3>

              {students.length === 0 ? (
                <div className="text-center py-12 bg-background border border-border rounded-xl border-dashed">
                  <p className="font-semibold text-foreground/50">No students assigned to this class yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-foreground/5 text-foreground/70 font-semibold uppercase tracking-wider text-xs">
                        <th className="p-4 border-b border-border/50 rounded-tl-xl">Roll No</th>
                        <th className="p-4 border-b border-border/50">Name</th>
                        <th className="p-4 border-b border-border/50">Email</th>
                        <th className="p-4 border-b border-border/50 text-right rounded-tr-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {students.map((student, idx) => (
                        <motion.tr
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                          key={student._id}
                          className="hover:bg-foreground/5 transition-colors"
                        >
                          <td className="p-4 font-medium text-foreground/80">{student.rollNo || 'N/A'}</td>
                          <td className="p-4 font-bold text-foreground">{student.name}</td>
                          <td className="p-4 font-medium text-foreground/70">{student.email}</td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => router.push(`/teacher/classes/${id}/students/${student._id}`)}
                                className="bg-background border border-border rounded-md px-3 py-1 font-semibold text-xs hover:bg-foreground/10 transition-colors cursor-pointer text-foreground"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handlePlacementClick(student)}
                                className="bg-primary/10 text-primary border border-primary/20 rounded-md p-1.5 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                                title="Update Placement"
                              >
                                <Briefcase size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteStudentClick(student)}
                                className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-md p-1.5 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                title="Delete Student"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Delete Student Modal */}
        <AnimatePresence>
          {studentToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
              onClick={() => setStudentToDelete(null)}
            >
              <motion.div
                initial={{ y: 20, scale: 0.95, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 20, scale: 0.95, opacity: 0 }}
                className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-border bg-red-500/10 text-red-500">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Trash2 size={20} /> Delete Student
                  </h2>
                  <button
                    onClick={() => setStudentToDelete(null)}
                    className="hover:bg-red-500/20 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6">
                  <p className="text-sm font-medium text-foreground/80 mb-6 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-foreground bg-foreground/10 px-1.5 rounded">{studentToDelete.name}</span>?
                    <br /><br />
                    This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStudentToDelete(null)}
                      className="flex-1 bg-background border border-border rounded-xl py-2.5 font-semibold text-sm hover:bg-foreground/5 transition-colors cursor-pointer text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteStudent}
                      className="flex-1 bg-red-500 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Student Manually Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ y: 20, scale: 0.95, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 20, scale: 0.95, opacity: 0 }}
                className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-border bg-primary/5 text-foreground">
                  <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <Users size={20} className="text-primary" /> Add Student
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="hover:bg-foreground/5 p-2 rounded-lg transition-colors cursor-pointer text-foreground/50 hover:text-foreground"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4">
                  {addError && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-lg border border-red-500/20 text-sm font-medium flex items-center gap-2">
                      <AlertCircle size={18} /> {addError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="student-name" className="text-xs font-semibold uppercase tracking-wider text-foreground/70 block">
                      Full Name
                    </label>
                    <input
                      id="student-name"
                      type="text"
                      required
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="student-email" className="text-xs font-semibold uppercase tracking-wider text-foreground/70 block">
                      Email Address
                    </label>
                    <input
                      id="student-email"
                      type="email"
                      required
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      placeholder="student@kiet.edu"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="student-roll" className="text-xs font-semibold uppercase tracking-wider text-foreground/70 block">
                      Roll Number
                    </label>
                    <input
                      id="student-roll"
                      type="text"
                      required
                      value={newStudent.rollNo}
                      onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      placeholder="CSE2021001"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-background border border-border rounded-xl py-3 font-semibold text-sm hover:bg-foreground/5 transition-colors cursor-pointer text-foreground"
                      disabled={addLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                      disabled={addLoading}
                    >
                      {addLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} /> Adding...
                        </>
                      ) : (
                        'Add Student'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Update Placement Modal */}
        <AnimatePresence>
          {showPlacementModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowPlacementModal(false)}
            >
              <motion.div
                initial={{ y: 20, scale: 0.95, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 20, scale: 0.95, opacity: 0 }}
                className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-border bg-primary/5 text-foreground">
                  <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <Briefcase size={20} className="text-primary" /> {placementViewMode ? 'Current Placement' : 'Update Placement'}
                  </h2>
                  <button
                    onClick={() => setShowPlacementModal(false)}
                    className="hover:bg-foreground/5 p-2 rounded-lg transition-colors cursor-pointer text-foreground/50 hover:text-foreground"
                  >
                    <X size={20} />
                  </button>
                </div>

                {placementViewMode ? (
                  <div className="p-6 space-y-6">
                    <div className="bg-background border border-border rounded-xl overflow-hidden">
                      <div className="bg-primary/10 p-4 border-b border-border flex justify-between items-center">
                        <div>
                          <p className="text-xs font-semibold text-foreground/50 uppercase mb-1 tracking-wider">Placed At</p>
                          <p className="text-xl font-bold text-foreground">{selectedStudentForPlacement?.placement?.company}</p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-2 text-primary">
                          <Briefcase size={24} />
                        </div>
                      </div>

                      <div className="p-4 grid grid-cols-2 gap-4">
                        {selectedStudentForPlacement?.placement?.currentCompany && (
                          <div className="border-r border-border pr-4">
                            <p className="text-xs font-semibold text-foreground/50 uppercase mb-1">Current Company</p>
                            <p className="text-sm font-bold text-foreground">{selectedStudentForPlacement.placement.currentCompany}</p>
                          </div>
                        )}

                        {selectedStudentForPlacement?.placement?.ctc && (
                          <div className={`${!selectedStudentForPlacement?.placement?.currentCompany ? 'col-span-2' : ''}`}>
                            <p className="text-xs font-semibold text-foreground/50 uppercase mb-1">CTC / LPA</p>
                            <p className="text-sm font-bold text-green-500">{selectedStudentForPlacement.placement.ctc}</p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 border-t border-border bg-foreground/5 flex justify-between items-center">
                        <p className="text-xs font-semibold text-foreground/70 uppercase">Placement Type</p>
                        <span className="bg-primary/10 text-primary px-2.5 py-1 text-xs font-bold uppercase rounded-md">
                          {selectedStudentForPlacement?.placement?.type?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-background border border-border border-dashed rounded-xl p-4 text-center">
                      <p className="font-semibold text-sm text-foreground/70">
                        Placement Changes: <span className="font-bold text-foreground bg-foreground/10 px-2 py-0.5 rounded ml-1">{selectedStudentForPlacement?.placementHistory?.length || 1}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setPlacementViewMode(false)}
                      className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Log New Company
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePlacementSubmit} className="p-6 space-y-4">
                    {placementError && (
                      <div className="bg-red-500/10 text-red-500 p-3 rounded-lg border border-red-500/20 text-sm font-medium flex items-center gap-2">
                        <AlertCircle size={18} /> {placementError}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label htmlFor="placement-company" className="text-xs font-semibold uppercase tracking-wider text-foreground/70 block">
                        Placement Company
                      </label>
                      <input
                        id="placement-company"
                        type="text"
                        value={placementData.company}
                        onChange={(e) => setPlacementData({ ...placementData, company: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        placeholder="e.g. Google"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="placement-currentCompany" className="text-xs font-semibold uppercase tracking-wider text-foreground/70 block">
                        Current Company
                      </label>
                      <input
                        id="placement-currentCompany"
                        type="text"
                        value={placementData.currentCompany}
                        onChange={(e) => setPlacementData({ ...placementData, currentCompany: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        placeholder="e.g. Amazon"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="placement-ctc" className="text-xs font-semibold uppercase tracking-wider text-foreground/70 block">
                        CTC / LPA
                      </label>
                      <input
                        id="placement-ctc"
                        type="text"
                        value={placementData.ctc}
                        onChange={(e) => setPlacementData({ ...placementData, ctc: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        placeholder="e.g. 12 LPA"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="placement-type" className="text-xs font-semibold uppercase tracking-wider text-foreground/70 block">
                        Placement Type
                      </label>
                      <select
                        id="placement-type"
                        value={placementData.type}
                        onChange={(e) => setPlacementData({ ...placementData, type: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      >
                        <option value="none">None</option>
                        <option value="intern">Intern</option>
                        <option value="full time ppo">Full Time PPO</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedStudentForPlacement?.placement?.company) {
                            setPlacementViewMode(true);
                          } else {
                            setShowPlacementModal(false);
                          }
                        }}
                        className="flex-1 bg-background border border-border rounded-xl py-3 font-semibold text-sm hover:bg-foreground/5 transition-colors cursor-pointer text-foreground"
                        disabled={placementLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                        disabled={placementLoading}
                      >
                        {placementLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={16} /> Updating...
                          </>
                        ) : (
                          'Update'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


      </main>
    </div>
  );
};

export default ClassDetails;
