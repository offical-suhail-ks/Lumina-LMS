import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listAssignments } from '../../services/assignmentService';
import { listCourses } from '../../services/courseService';

const ViewGrades = () => {
  const user = useSelector(state => state.auth.user);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsData, coursesData] = await Promise.all([
        listAssignments(),
        listCourses(),
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all submissions with grades for the current student
  const getGradedSubmissions = () => {
    const graded = [];
    assignments.forEach(assignment => {
      if (assignment.submissions) {
        assignment.submissions.forEach(submission => {
          if (submission.studentId === user?.id && submission.grade !== null && submission.grade !== undefined) {
            graded.push({
              ...submission,
              assignmentTitle: assignment.title,
              courseId: assignment.courseId,
              dueDate: assignment.dueDate,
            });
          }
        });
      }
    });
    return graded;
  };

  const gradedSubmissions = getGradedSubmissions();
  const filteredSubmissions = selectedCourse === 'all' 
    ? gradedSubmissions 
    : gradedSubmissions.filter(s => s.courseId === selectedCourse);

  // Calculate average grade
  const averageGrade = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((sum, s) => sum + (parseFloat(s.grade) || 0), 0) / gradedSubmissions.length).toFixed(1)
    : 0;

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  const getGradeColor = (grade) => {
    const numGrade = parseFloat(grade);
    if (numGrade >= 90) return 'text-emerald-600 bg-emerald-50';
    if (numGrade >= 80) return 'text-blue-600 bg-blue-50';
    if (numGrade >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading grades...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">My Grades</h1>
            <p className="mt-2 text-sm text-slate-500">
              View your grades and feedback for all submitted assignments.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Average Grade</p>
            <p className={`text-3xl font-semibold ${getGradeColor(averageGrade)} px-4 py-2 rounded-xl inline-block`}>
              {averageGrade}%
            </p>
          </div>
        </div>
      </header>

      {/* Course Filter */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-slate-700">Filter by course:</span>
          <button
            onClick={() => setSelectedCourse('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              selectedCourse === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Courses
          </button>
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                selectedCourse === course.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {course.title}
            </button>
          ))}
        </div>
      </div>

      {/* Grades List */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        {filteredSubmissions.length > 0 ? (
          <div className="space-y-4">
            {filteredSubmissions.map(submission => (
              <div
                key={submission.id}
                className="rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-slate-900">{submission.assignmentTitle}</h3>
                      <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                        {getCourseName(submission.courseId)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">
                      Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                    {submission.feedback && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Feedback:</p>
                        <p className="text-sm text-slate-600">{submission.feedback}</p>
                      </div>
                    )}
                    {submission.gradedAt && (
                      <p className="text-xs text-slate-400 mt-2">
                        Graded on: {new Date(submission.gradedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${getGradeColor(submission.grade)}`}>
                      <span className="text-2xl font-bold">{submission.grade}%</span>
                    </div>
                    {parseFloat(submission.grade) >= 90 && (
                      <p className="text-xs text-emerald-600 font-semibold mt-2">Excellent!</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className="text-slate-500">No graded assignments yet.</p>
            <p className="text-sm text-slate-400 mt-2">
              Your grades will appear here once your submissions are graded.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ViewGrades;

