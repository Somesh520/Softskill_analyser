import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Mail, Hash, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import Sidebar, { SidebarProvider } from '../../components/layout/Sidebar';
import { getClasses, getClassDetails } from '../../api/teacherApi';

const AssignedStudents = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [classes, setClasses] = useState([]);

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
    fetchAllStudents();
  }, [navigate]);

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const classList = await getClasses();
      setClasses(classList);

      // Fetch students for each class and flatten
      const studentPromises = classList.map(cls => getClassDetails(cls._id));
      const results = await Promise.all(studentPromises);
      
      const flattenedStudents = results.flatMap(res => 
        res.students.map(s => ({
          ...s,
          className: res.classDetails.name,
          classId: res.classDetails._id
        }))
      );

      setAllStudents(flattenedStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (student.rollNo && student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesClass = filterClass === 'All' || student.className === filterClass;
    
    return matchesSearch && matchesClass;
  });

  if (!teacherData) return null;

  return (
        <div className="flex flex-col flex-1 h-full w-full">
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-[#00FFFF] border-8 border-black p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            style={{ boxShadow: '16px 16px 0px #000' }}
          >
            <div className="flex items-center gap-6">
              <div className="bg-white p-4 border-4 border-black text-black" style={{ boxShadow: '4px 4px 0px #000' }}>
                <Users size={48} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase mb-1 leading-none tracking-tight text-black">My All Students</h2>
                <p className="text-base font-bold text-black uppercase tracking-widest text-opacity-60 bg-[#FFEB3B] inline-block px-2 border-2 border-black mt-2">
                  Unified view of all students across your classes.
                </p>
              </div>
            </div>
            
            <div className="bg-white text-black p-4 border-4 border-black flex flex-col items-center min-w-[150px]" style={{ boxShadow: '8px 8px 0px #000' }}>
              <span className="text-4xl font-black">{allStudents.length}</span>
              <span className="text-sm font-bold uppercase tracking-widest">Total Enrolled</span>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={24} />
              <input 
                type="text"
                placeholder="SEARCH BY NAME, EMAIL, OR ROLL NO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-4 border-black p-4 pl-14 font-bold uppercase tracking-tight focus:outline-none focus:bg-[#00FF00] transition-colors"
                style={{ boxShadow: '4px 4px 0px #000' }}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={24} />
              <select 
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full bg-white border-4 border-black p-4 pl-14 font-bold uppercase tracking-tight focus:outline-none appearance-none cursor-pointer"
                style={{ boxShadow: '4px 4px 0px #000' }}
              >
                <option value="All">All Classes</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls.name}>{cls.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white border-8 border-black p-6 mb-10" style={{ boxShadow: '12px 12px 0px #000' }}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-black" />
                <p className="font-black uppercase text-xl">Reticulating Splines...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-20 bg-[#f8f8f8] border-4 border-black border-dashed">
                <p className="font-bold text-lg uppercase text-gray-500">No students found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black text-white uppercase text-sm tracking-widest">
                      <th className="p-4 border-b-4 border-black">Roll No</th>
                      <th className="p-4 border-b-4 border-black">Name</th>
                      <th className="p-4 border-b-4 border-black">Class</th>
                      <th className="p-4 border-b-4 border-black">Email</th>
                      <th className="p-4 border-b-4 border-black text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        key={student._id} 
                        className="border-b-4 border-black hover:bg-[#FF00FF] hover:bg-opacity-10 transition-colors"
                      >
                        <td className="p-4 font-black">{student.rollNo || 'N/A'}</td>
                        <td className="p-4 font-black uppercase text-lg">{student.name}</td>
                        <td className="p-4">
                          <span className="bg-[#00FF00] px-3 py-1 border-2 border-black font-black uppercase text-xs">
                            {student.className}
                          </span>
                        </td>
                        <td className="p-4 font-bold flex items-center gap-2">
                           <Mail size={16} /> {student.email}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => navigate(`/teacher/classes/${student.classId}`)}
                            className="bg-white border-4 border-black px-4 py-2 font-black uppercase text-sm flex items-center gap-2 hover:bg-black hover:text-white transition-all ml-auto"
                            style={{ boxShadow: '4px 4px 0px #000' }}
                          >
                            View Class <ExternalLink size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    
  );
};

export default AssignedStudents;