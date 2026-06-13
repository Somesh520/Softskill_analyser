import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowLeft, BookOpen, GraduationCap, Upload, ShieldCheck, FileText, Trash2, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Sidebar, { SidebarProvider } from '../../components/layout/Sidebar';
import { getClassDetails, uploadStudentCsv, deleteStudent, addStudentManually } from '../../api/teacherApi';

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New Animation States
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, processing, success, error
  const [uploadMessage, setUploadMessage] = useState('');
  
  const [studentToDelete, setStudentToDelete] = useState(null);
  const fileInputRef = React.useRef(null);

  // Manual Add Student States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', rollNo: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!token || !userString) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userString);
    if (user.role && user.role.toLowerCase() !== 'teacher') {
      navigate('/');
      return;
    }

    setTeacherData(user);
    fetchDetails();
  }, [id, navigate]);

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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a valid CSV file.');
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
      
      // Keep success state for a moment then refresh
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
      alert(err.message || 'Failed to delete student');
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

  if (!teacherData) return null;

  return (
        <div className="flex flex-col flex-1 h-full w-full">
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
          
          <button 
            onClick={() => navigate('/teacher/classes')}
            className="mb-6 flex items-center gap-2 font-black uppercase text-xl hover:-translate-y-1 transition-transform bg-white border-4 border-black px-4 py-2"
            style={{ boxShadow: '4px 4px 0px #000' }}
          >
            <ArrowLeft strokeWidth={3} size={20} /> Back to Classes
          </button>

          {loading ? (
             <div className="text-center py-20 font-black text-2xl uppercase">Loading Details...</div>
          ) : error ? (
             <div className="bg-[#FF0000] text-white p-6 border-8 border-black font-black uppercase text-xl" style={{ boxShadow: '8px 8px 0px #000' }}>
               Error: {error}
             </div>
          ) : classData && (
            <>
              {/* Header Banner */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 bg-[#FF00FF] border-8 border-black p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                style={{ boxShadow: '16px 16px 0px #000' }}
              >
                <div className="flex items-center gap-6">
                  <div className="bg-white p-4 border-4 border-black text-black" style={{ boxShadow: '4px 4px 0px #000' }}>
                    <BookOpen size={48} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase mb-1 leading-none tracking-tight text-white">{classData.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="font-bold text-black uppercase tracking-widest text-sm bg-[#00FFFF] px-2 py-1 border-2 border-black">
                        {classData.program} - {classData.branch}
                      </span>
                      <span className="font-bold text-black uppercase tracking-widest text-sm bg-[#FFEB3B] px-2 py-1 border-2 border-black">
                        Sem {classData.semester}
                      </span>
                      <span className="font-bold text-black uppercase tracking-widest text-sm bg-[#00FF00] px-2 py-1 border-2 border-black">
                        Sec {classData.section}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black text-white p-4 border-4 border-white flex flex-col items-center min-w-[120px]">
                  <span className="text-4xl font-black">{students.length}</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Students</span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                <button 
                  className={`bg-[#00FF00] border-4 border-black px-6 py-3 font-black uppercase flex items-center gap-2 transition-transform text-black ${uploading ? 'opacity-50 cursor-wait' : 'hover:-translate-y-1 cursor-pointer'}`}
                  style={{ boxShadow: uploading ? '0px 0px 0px #000' : '4px 4px 0px #000' }}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload size={20} strokeWidth={3} /> {uploading ? 'Processing CSV...' : 'Upload Student CSV'}
                </button>
                <button 
                  className="bg-[#00FFFF] border-4 border-black px-6 py-3 font-black uppercase flex items-center gap-2 hover:-translate-y-1 transition-transform text-black"
                  style={{ boxShadow: '4px 4px 0px #000' }}
                  onClick={() => alert("Evaluation functionality coming next!")}
                >
                  <FileText size={20} strokeWidth={3} /> Evaluate Class
                </button>
                <button 
                  className="bg-[#FFEB3B] border-4 border-black px-6 py-3 font-black uppercase flex items-center gap-2 hover:-translate-y-1 transition-transform text-black cursor-pointer"
                  style={{ boxShadow: '4px 4px 0px #000' }}
                  onClick={() => {
                    setAddError('');
                    setShowAddModal(true);
                  }}
                >
                  <Users size={20} strokeWidth={3} /> Add Student Manually
                </button>
              </div>

              {/* Upload Animation Overlay */}
              <AnimatePresence>
                {uploading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md p-6"
                  >
                    <motion.div 
                      initial={{ scale: 0.8, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="bg-white border-8 border-black p-10 max-w-md w-full text-center relative"
                      style={{ boxShadow: '20px 20px 0px #00FF00' }}
                    >
                      <div className="flex justify-center mb-6">
                        {uploadStatus === 'processing' && (
                          <div className="relative">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="w-24 h-24 border-8 border-black border-t-[#00FF00] rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Upload size={32} className="animate-bounce" />
                            </div>
                          </div>
                        )}
                        {uploadStatus === 'success' && (
                          <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            className="bg-[#00FF00] p-6 border-4 border-black rounded-full"
                          >
                            <CheckCircle2 size={64} color="black" />
                          </motion.div>
                        )}
                        {uploadStatus === 'error' && (
                          <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1, shake: [0, 10, -10, 10, 0] }}
                            className="bg-[#FF0000] p-6 border-4 border-black rounded-full"
                          >
                            <AlertCircle size={64} color="white" />
                          </motion.div>
                        )}
                      </div>

                      <h2 className="text-3xl font-black uppercase mb-4 tracking-tight">
                        {uploadStatus === 'processing' ? 'Syncing Students' : 
                         uploadStatus === 'success' ? 'Records Secured' : 'Upload Failed'}
                      </h2>
                      
                      <p className="font-bold text-lg uppercase bg-black text-white px-4 py-2 inline-block">
                        {uploadMessage}
                      </p>

                      {uploadStatus === 'processing' && (
                        <div className="mt-8 h-4 w-full bg-gray-200 border-2 border-black overflow-hidden">
                          <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="h-full w-1/3 bg-[#00FF00]"
                          />
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Student List */}
              <div className="bg-white border-8 border-black p-6" style={{ boxShadow: '8px 8px 0px #000' }}>
                <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                  <Users size={28} /> Enrolled Students
                </h3>
                
                {students.length === 0 ? (
                  <div className="text-center py-10 bg-[#f8f8f8] border-4 border-black border-dashed">
                    <p className="font-bold text-lg uppercase text-gray-500">No students assigned to this class yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black text-white uppercase text-sm tracking-wider">
                          <th className="p-4 border-b-4 border-black">Roll No</th>
                          <th className="p-4 border-b-4 border-black">Name</th>
                          <th className="p-4 border-b-4 border-black">Email</th>
                          <th className="p-4 border-b-4 border-black">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={student._id} 
                            className="border-b-4 border-black hover:bg-[#00FFFF] hover:bg-opacity-20 transition-colors"
                          >
                            <td className="p-4 font-bold">{student.rollNo || 'N/A'}</td>
                            <td className="p-4 font-bold uppercase">{student.name}</td>
                            <td className="p-4 font-bold">{student.email}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button className="bg-white border-2 border-black px-3 py-1 font-black text-sm uppercase hover:bg-black hover:text-white transition-colors">
                                  View
                                </button>
                                <button 
                                  onClick={() => handleDeleteStudentClick(student)}
                                  className="bg-[#FF0000] border-2 border-black p-1 text-white hover:bg-black transition-colors"
                                  title="Delete Student"
                                >
                                  <Trash2 size={18} />
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
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="bg-white border-8 border-black w-full max-w-md"
                  style={{ boxShadow: '16px 16px 0px #000' }}
                >
                  <div className="flex justify-between items-center p-6 border-b-4 border-black bg-[#FF0000]">
                    <h2 className="text-2xl font-black uppercase text-white flex items-center gap-3">
                      <Trash2 size={28} /> Delete Student
                    </h2>
                    <button 
                      onClick={() => setStudentToDelete(null)}
                      className="bg-white border-4 border-black p-1 hover:bg-black hover:text-white transition-colors"
                      style={{ boxShadow: '4px 4px 0px #000' }}
                    >
                      <X size={24} strokeWidth={3} />
                    </button>
                  </div>

                  <div className="p-6">
                    <p className="text-lg font-bold uppercase mb-6">
                      Are you sure you want to delete <span className="text-[#FF0000] font-black bg-[#FFEB3B] px-2 border-2 border-black inline-block">{studentToDelete.name}</span>? 
                      <br /><br />
                      This action cannot be undone.
                    </p>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setStudentToDelete(null)}
                        className="flex-1 bg-white border-4 border-black py-3 font-black uppercase hover:bg-[#f0f0f0] transition-colors"
                        style={{ boxShadow: '4px 4px 0px #000' }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={confirmDeleteStudent}
                        className="flex-1 bg-[#FF0000] text-white border-4 border-black py-3 font-black uppercase hover:bg-black transition-colors"
                        style={{ boxShadow: '4px 4px 0px #000' }}
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
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="bg-white border-8 border-black w-full max-w-md"
                  style={{ boxShadow: '16px 16px 0px #000' }}
                >
                  <div className="flex justify-between items-center p-6 border-b-4 border-black bg-[#FFEB3B]">
                    <h2 className="text-2xl font-black uppercase text-black flex items-center gap-3">
                      <Users size={28} /> Add Student
                    </h2>
                    <button 
                      onClick={() => setShowAddModal(false)}
                      className="bg-white border-4 border-black p-1 hover:bg-black hover:text-white transition-colors cursor-pointer"
                      style={{ boxShadow: '4px 4px 0px #000' }}
                    >
                      <X size={24} strokeWidth={3} />
                    </button>
                  </div>

                  <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-6">
                    {addError && (
                      <div className="bg-[#FF0000] text-white p-4 border-4 border-black font-black uppercase text-sm flex items-center gap-2">
                        <AlertCircle size={20} /> {addError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label htmlFor="student-name" className="text-sm font-black uppercase text-black block">
                        Full Name
                      </label>
                      <input
                        id="student-name"
                        type="text"
                        required
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        className="w-full border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#00FFFF]"
                        placeholder="John Doe"
                        style={{ borderRadius: 0 }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="student-email" className="text-sm font-black uppercase text-black block">
                        Email Address
                      </label>
                      <input
                        id="student-email"
                        type="email"
                        required
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                        className="w-full border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#00FFFF]"
                        placeholder="student@kiet.edu"
                        style={{ borderRadius: 0 }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="student-roll" className="text-sm font-black uppercase text-black block">
                        Roll Number
                      </label>
                      <input
                        id="student-roll"
                        type="text"
                        required
                        value={newStudent.rollNo}
                        onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                        className="w-full border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#00FFFF]"
                        placeholder="CSE2021001"
                        style={{ borderRadius: 0 }}
                      />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button 
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 bg-white border-4 border-black py-3 font-black uppercase hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                        style={{ boxShadow: '4px 4px 0px #000' }}
                        disabled={addLoading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-[#00FF00] text-black border-4 border-black py-3 font-black uppercase hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                        style={{ boxShadow: '4px 4px 0px #000' }}
                        disabled={addLoading}
                      >
                        {addLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={18} /> Adding...
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

        </main>
      </div>
    
  );
};

export default ClassDetails;
