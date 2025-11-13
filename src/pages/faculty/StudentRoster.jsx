import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listCourses } from '../../services/courseService';
import { listStudents } from '../../services/studentService';

const StudentRoster = () => {
  const user = useSelector(state => state.auth.user);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesData, studentsData] = await Promise.all([
        listCourses(),
        listStudents(),
      ]);
      
      // Filter courses by department (show all courses from faculty's department)
      // If faculty has no department set, show all courses (fallback)
      const myCourses = user?.department
        ? coursesData.filter(c => 
            c.department && 
            c.department.toLowerCase() === user.department.toLowerCase()
          )
        : coursesData; // Show all courses if department not set
      
      setCourses(myCourses);
      setStudents(studentsData);
      
      if (myCourses.length > 0) {
        setSelectedCourse(myCourses[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEnrolledStudents = () => {
    if (!selectedCourse) return [];
    
    // Get students enrolled via course_enrollments table
    const enrolledIds = selectedCourse.enrolled || [];
    
    // Also include students who have this course as their primary course_id
    const studentsInCourse = students.filter(s => {
      // Check if enrolled via course_enrollments
      if (enrolledIds.includes(s.id)) {
        return true;
      }
      // Check if this is their primary course
      if (s.courseId === selectedCourse.id) {
        return true;
      }
      return false;
    });
    
    return studentsInCourse;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading roster...</div>
      </div>
    );
  }

  const enrolledStudents = getEnrolledStudents();

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Student Roster</h1>
        <p className="mt-2 text-sm text-slate-500">
          View and manage students enrolled in your courses.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Course Selector */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Course</h2>
            <div className="space-y-2">
              {courses.length > 0 ? (
                courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                      selectedCourse?.id === course.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {course.enrolled?.length || 0} students
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">No courses available</p>
              )}
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="lg:col-span-3">
          {selectedCourse ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selectedCourse.title}</h2>
                  <p className="text-sm text-slate-500">
                    {enrolledStudents.length} student{enrolledStudents.length !== 1 ? 's' : ''} enrolled
                  </p>
                </div>
              </div>

              {enrolledStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Student</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Year</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledStudents.map(student => (
                        <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <p className="text-sm font-semibold text-slate-900">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{student.id || 'N/A'}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{student.email || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{student.year || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              student.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : student.status === 'inactive'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {student.status || 'active'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              to={`/mailbox/send?to=${encodeURIComponent(student.email)}`}
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                            >
                              Message
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No students enrolled in this course yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
              <p className="text-sm text-slate-500">Select a course to view students</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRoster;

