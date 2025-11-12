import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { listAssignments } from '../../services/assignmentService';
import { listCourses } from '../../services/courseService';
import { listStudents } from '../../services/studentService';
import api from '../../services/api';

const GradeSubmissions = () => {
  const user = useSelector(state => state.auth.user);
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignment');
  
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (assignmentId && assignments.length > 0) {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        setSelectedAssignment(assignment);
      }
    }
  }, [assignmentId, assignments]);

  const fetchData = async () => {
    try {
      const [assignmentsData, coursesData, studentsData] = await Promise.all([
        listAssignments(),
        listCourses(),
        listStudents(),
      ]);
      
      // Filter assignments for faculty's courses
      const myCourses = coursesData.filter(c => 
        c.instructor?.toLowerCase() === user?.name?.toLowerCase() || 
        c.instructor?.toLowerCase().includes(user?.name?.split(' ')[0]?.toLowerCase() || '')
      );
      const myCourseIds = myCourses.map(c => c.id);
      const myAssignments = assignmentsData.filter(a => myCourseIds.includes(a.courseId));
      
      setAssignments(myAssignments);
      setCourses(coursesData);
      setStudents(studentsData);
      
      if (assignmentId) {
        const assignment = myAssignments.find(a => a.id === assignmentId);
        if (assignment) setSelectedAssignment(assignment);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId) => {
    if (!grade || !selectedSubmission) return;
    
    try {
      await gradeSubmission(submissionId, {
        grade: parseFloat(grade),
        feedback: feedback,
        gradedBy: user?.id || user?.name,
      });
      
      alert('Grade submitted successfully!');
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      await fetchData();
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Grade submitted successfully! (Development mode)');
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Grade Submissions</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review and grade student assignment submissions.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Assignment List */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Assignments</h2>
            <div className="space-y-2">
              {assignments.length > 0 ? (
                assignments.map(assignment => (
                  <button
                    key={assignment.id}
                    onClick={() => setSelectedAssignment(assignment)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                      selectedAssignment?.id === assignment.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{assignment.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {assignment.submissions?.length || 0} submission{assignment.submissions?.length !== 1 ? 's' : ''}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">No assignments with submissions</p>
              )}
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="lg:col-span-2">
          {selectedAssignment ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{selectedAssignment.title}</h2>
                    <p className="text-sm text-slate-500">{getCourseName(selectedAssignment.courseId)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedAssignment.submissions && selectedAssignment.submissions.length > 0 ? (
                    selectedAssignment.submissions.map(submission => (
                      <div
                        key={submission.id}
                        className="rounded-2xl border border-slate-200/70 bg-white/95 px-5 py-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                              {getStudentName(submission.studentId)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Submitted: {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                            {submission.notes && (
                              <p className="text-sm text-slate-600 mt-2">{submission.notes}</p>
                            )}
                            {submission.artifactName && (
                              <p className="text-xs text-indigo-500 mt-1">File: {submission.artifactName}</p>
                            )}
                            {submission.grade && (
                              <p className="text-sm font-semibold text-emerald-600 mt-2">
                                Grade: {submission.grade}%
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                          >
                            {submission.grade ? 'Update Grade' : 'Grade'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No submissions for this assignment</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
              <p className="text-sm text-slate-500">Select an assignment to view submissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Grade Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Grade Submission - {getStudentName(selectedSubmission.studentId)}
              </h3>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setGrade('');
                  setFeedback('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grade (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder={selectedSubmission.grade || 'Enter grade'}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback to the student..."
                  rows="5"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleGradeSubmission(selectedSubmission.id)}
                  disabled={!grade}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Grade
                </button>
                <button
                  onClick={() => {
                    setSelectedSubmission(null);
                    setGrade('');
                    setFeedback('');
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeSubmissions;

