import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { analyticsService } from '../../services/analyticsService';

const AnalyticsDashboard = () => {
  const user = useSelector(state => state.auth.user);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      let data;
      if (user.role === 'admin') {
        data = await analyticsService.getSystemAnalytics();
      } else if (user.role === 'student') {
        data = await analyticsService.getStudentPerformance(user.id);
      }
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-black">Loading analytics...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Performance insights and statistics</p>
      </div>

      {user.role === 'admin' && analytics && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Total Students</p>
            <p className="text-3xl font-bold text-black">{analytics.studentCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Total Courses</p>
            <p className="text-3xl font-bold text-black">{analytics.courseCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Total Assignments</p>
            <p className="text-3xl font-bold text-black">{analytics.assignmentCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Total Submissions</p>
            <p className="text-3xl font-bold text-black">{analytics.submissionCount}</p>
          </div>
        </div>
      )}

      {user.role === 'student' && analytics && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Assignment Average</p>
              <p className="text-3xl font-bold text-black">{analytics.assignmentAverage?.toFixed(1)}%</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Quiz Average</p>
              <p className="text-3xl font-bold text-black">{analytics.quizAverage?.toFixed(1)}%</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Overall Average</p>
              <p className="text-3xl font-bold text-black">{analytics.overallAverage?.toFixed(1)}%</p>
            </div>
          </div>

          {analytics.assignmentGrades && analytics.assignmentGrades.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-black mb-4">Recent Assignment Grades</h2>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="space-y-3">
                  {analytics.assignmentGrades.slice(0, 5).map((assignment, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-black">{assignment.title}</p>
                        <p className="text-sm text-gray-600">{assignment.courseId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-black">{assignment.grade || 'N/A'}</p>
                        {assignment.submittedAt && (
                          <p className="text-xs text-gray-500">{new Date(assignment.submittedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {analytics.quizScores && analytics.quizScores.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Recent Quiz Scores</h2>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="space-y-3">
                  {analytics.quizScores.slice(0, 5).map((quiz, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-black">{quiz.title}</p>
                        <p className="text-sm text-gray-600">{quiz.courseId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-black">{quiz.percentage?.toFixed(1)}%</p>
                        {quiz.passed !== null && (
                          <p className={`text-xs ${quiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {quiz.passed ? 'Passed' : 'Failed'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {user.role === 'admin' && analytics && analytics.recentActivity && analytics.recentActivity.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-black mb-4">Recent Activity (Last 7 Days)</h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-3">
              {analytics.recentActivity.slice(0, 10).map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-black">{activity.eventType}</p>
                    <p className="text-sm text-gray-600">{activity.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-black">{activity.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

