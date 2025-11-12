import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listAssignments } from '../../services/assignmentService';
import { listCourses } from '../../services/courseService';

const MySubmissions = () => {
  const user = useSelector(state => state.auth.user);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, submitted, pending

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

  // Get student's submissions
  const getMySubmissions = () => {
    const mySubmissions = [];
    assignments.forEach(assignment => {
      if (assignment.submissions) {
        const mySubmission = assignment.submissions.find(s => s.studentId === user?.id);
        if (mySubmission) {
          mySubmissions.push({
            ...mySubmission,
            assignmentTitle: assignment.title,
            assignmentId: assignment.id,
            courseId: assignment.courseId,
            dueDate: assignment.dueDate,
          });
        } else {
          // Assignment exists but not submitted
          const now = new Date();
          const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
          const isOverdue = due && due < now;
          mySubmissions.push({
            assignmentTitle: assignment.title,
            assignmentId: assignment.id,
            courseId: assignment.courseId,
            dueDate: assignment.dueDate,
            submitted: false,
            isOverdue,
          });
        }
      }
    });
    return mySubmissions;
  };

  const allSubmissions = getMySubmissions();
  
  const filteredSubmissions = filter === 'all' 
    ? allSubmissions 
    : filter === 'submitted'
    ? allSubmissions.filter(s => s.submitted !== false)
    : allSubmissions.filter(s => s.submitted === false);

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  const getStatusBadge = (submission) => {
    if (!submission.submitted) {
      if (submission.isOverdue) {
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">Overdue</span>;
      }
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Not Submitted</span>;
    }
    if (submission.grade !== null && submission.grade !== undefined) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Graded</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Pending Review</span>;
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
            <h1 className="text-2xl font-semibold text-slate-900">My Submissions</h1>
            <p className="mt-2 text-sm text-slate-500">
              Track all your assignment submissions and their status.
            </p>
          </div>
          <Link
            to="/assignments/submit"
            className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Submit Assignment
          </Link>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({allSubmissions.length})
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === 'submitted'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Submitted ({allSubmissions.filter(s => s.submitted !== false).length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === 'pending'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pending ({allSubmissions.filter(s => s.submitted === false).length})
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        {filteredSubmissions.length > 0 ? (
          <div className="space-y-4">
            {filteredSubmissions.map((submission, index) => (
              <div
                key={submission.id || `pending-${index}`}
                className="rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-slate-900">{submission.assignmentTitle}</h3>
                      {getStatusBadge(submission)}
                    </div>
                    <p className="text-sm text-indigo-500 mb-2">
                      {getCourseName(submission.courseId)}
                    </p>
                    {submission.submitted ? (
                      <>
                        <p className="text-sm text-slate-500 mb-2">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                        {submission.notes && (
                          <p className="text-sm text-slate-600 mt-2">Notes: {submission.notes}</p>
                        )}
                        {submission.artifactName && (
                          <p className="text-xs text-slate-500 mt-1">File: {submission.artifactName}</p>
                        )}
                        {submission.grade !== null && submission.grade !== undefined && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">Grade:</span>
                            <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
                              parseFloat(submission.grade) >= 90 ? 'text-emerald-600 bg-emerald-50' :
                              parseFloat(submission.grade) >= 80 ? 'text-blue-600 bg-blue-50' :
                              parseFloat(submission.grade) >= 70 ? 'text-amber-600 bg-amber-50' :
                              'text-rose-600 bg-rose-50'
                            }`}>
                              {submission.grade}%
                            </span>
                          </div>
                        )}
                        {submission.feedback && (
                          <div className="mt-3 p-3 bg-indigo-50 rounded-xl">
                            <p className="text-xs font-semibold text-indigo-700 mb-1">Feedback:</p>
                            <p className="text-sm text-indigo-900">{submission.feedback}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {submission.dueDate && (
                          <p className={`text-sm font-semibold ${
                            submission.isOverdue ? 'text-rose-600' : 'text-slate-600'
                          }`}>
                            Due: {new Date(submission.dueDate).toLocaleString()}
                          </p>
                        )}
                        <Link
                          to={`/assignments/submit?assignment=${submission.assignmentId}`}
                          className="mt-3 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          Submit Now
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No submissions found.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MySubmissions;

