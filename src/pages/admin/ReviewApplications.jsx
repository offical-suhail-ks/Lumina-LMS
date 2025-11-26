import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAccountingTasks, getAccountingTask, reviewTask } from '../../services/accountingService';

const ReviewApplications = () => {
  const user = useSelector(state => state.auth.user);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('under_review');
  const [showModal, setShowModal] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, statusFilter]);

  const fetchTasks = async () => {
    try {
      // Get all tasks and filter for those that need admin review
      // Tasks sent from accounting will have status 'pending' (after sendTaskToAdmin)
      // or 'in_progress' (if they were already in progress)
      // We want to show tasks that are ready for admin review
      const allTasks = await getAccountingTasks();
      const reviewTasks = allTasks.filter(t => {
        // Show tasks that:
        // 1. Have student application_status as 'under_review', OR
        // 2. Have task status as 'pending' (sent from accounting), OR
        // 3. Have task status as 'in_progress' (already in review)
        return (
          t.applicationStatus === 'under_review' || 
          t.status === 'pending' ||
          t.status === 'in_progress'
        );
      });
      setTasks(reviewTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    if (statusFilter === 'all') {
      setFilteredTasks(tasks);
    } else if (statusFilter === 'under_review') {
      // Show all tasks that are ready for review (regardless of task status)
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(t => t.applicationStatus === statusFilter));
    }
  };

  const handleViewTask = async (task) => {
    try {
      const fullTask = await getAccountingTask(task.id);
      setSelectedTask(fullTask);
      setAdminRemarks(fullTask.adminRemarks || '');
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  };

  const handleReview = async (action) => {
    if (!selectedTask) return;

    try {
      await reviewTask(selectedTask.id, user.id, action, adminRemarks);
      setShowModal(false);
      setSelectedTask(null);
      setAdminRemarks('');
      await fetchTasks();
      alert(`Application ${action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'sent back to accounting'} successfully!`);
    } catch (error) {
      console.error('Error reviewing task:', error);
      alert('Failed to review application. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Review Student Applications</h1>
        <p className="mt-2 text-sm text-slate-500">Review fee setup and approve or send back to accounting team</p>
      </header>

      {/* Filters */}
      <div className="flex gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            statusFilter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setStatusFilter('under_review')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            statusFilter === 'under_review'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Under Review ({tasks.filter(t => t.applicationStatus === 'under_review').length})
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {task.studentFirstName} {task.studentLastName}
                  </h3>
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                    Under Review
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{task.studentEmail}</p>
                {task.feeDetails && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Course Fee:</span>
                      <span className="ml-2 font-semibold text-slate-900">
                        {formatCurrency(task.feeDetails.courseFee)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Payment Plan:</span>
                      <span className="ml-2 font-semibold text-slate-900 capitalize">
                        {task.feeDetails.paymentPlan || 'N/A'}
                      </span>
                    </div>
                    {task.feeDetails.feeDueDate && (
                      <div>
                        <span className="text-slate-500">Due Date:</span>
                        <span className="ml-2 font-semibold text-slate-900">
                          {formatDate(task.feeDetails.feeDueDate)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {task.accountingRemarks && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="text-xs font-semibold text-green-900">Accounting Remarks:</p>
                    <p className="mt-1 text-sm text-green-700">{task.accountingRemarks}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewTask(task)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-12 text-center">
            <p className="text-slate-500">No applications pending review</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Review Application</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTask(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Student Information */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-3 font-semibold text-slate-900">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Name:</span>
                    <span className="ml-2 font-medium text-slate-900">
                      {selectedTask.studentFirstName} {selectedTask.studentLastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedTask.studentEmail}</span>
                  </div>
                  {selectedTask.studentPhone && (
                    <div>
                      <span className="text-slate-500">Phone:</span>
                      <span className="ml-2 font-medium text-slate-900">{selectedTask.studentPhone}</span>
                    </div>
                  )}
                  {selectedTask.studentData?.course && (
                    <div>
                      <span className="text-slate-500">Course:</span>
                      <span className="ml-2 font-medium text-slate-900">
                        {selectedTask.studentData.course.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fee Details */}
              {selectedTask.feeDetails && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-3 font-semibold text-slate-900">Fee Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Course Fee:</span>
                      <span className="ml-2 font-semibold text-slate-900">
                        {formatCurrency(selectedTask.feeDetails.courseFee)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Payment Plan:</span>
                      <span className="ml-2 font-semibold text-slate-900 capitalize">
                        {selectedTask.feeDetails.paymentPlan || 'N/A'}
                      </span>
                    </div>
                    {selectedTask.feeDetails.paymentPlanDetails && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Plan Details:</span>
                        <p className="mt-1 text-slate-900">{selectedTask.feeDetails.paymentPlanDetails}</p>
                      </div>
                    )}
                    {selectedTask.feeDetails.feeDueDate && (
                      <div>
                        <span className="text-slate-500">Due Date:</span>
                        <span className="ml-2 font-semibold text-slate-900">
                          {formatDate(selectedTask.feeDetails.feeDueDate)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500">Send Reminders:</span>
                      <span className="ml-2 font-semibold text-slate-900">
                        {selectedTask.feeDetails.sendReminder ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {selectedTask.adminRemarks && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-blue-900">Previous Admin Remarks</h4>
                  <p className="text-sm text-blue-700">{selectedTask.adminRemarks}</p>
                </div>
              )}

              {selectedTask.accountingRemarks && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-green-900">Accounting Remarks</h4>
                  <p className="text-sm text-green-700">{selectedTask.accountingRemarks}</p>
                </div>
              )}

              {/* Admin Remarks */}
              <div>
                <h3 className="mb-2 font-semibold text-slate-900">Your Remarks</h3>
                <textarea
                  rows="4"
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Add remarks about this application (optional)..."
                />
                <p className="mt-1 text-xs text-slate-500">
                  {selectedTask.status === 'in_progress' 
                    ? 'Remarks will be sent back to accounting team if you send back for revision'
                    : 'Remarks will be included in the review'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTask(null);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  onClick={() => handleReview('send_back')}
                  className="flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Send Back to Accounting
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reject this application?')) {
                      handleReview('reject');
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to accept this application and send the offer letter to the student?')) {
                      handleReview('accept');
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition hover:bg-green-500"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Accept & Send Offer Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewApplications;

