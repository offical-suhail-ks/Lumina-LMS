import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  getAccountingTasks,
  getAccountingTask,
  updateAccountingTask,
  completeAccountingTask,
  sendTaskToAdmin,
} from '../../services/accountingService';

const AccountingTasks = () => {
  const user = useSelector(state => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(() => {
    // Get initial status from URL query params
    return searchParams.get('status') || 'all';
  });
  const [showModal, setShowModal] = useState(false);
  const [feeDetails, setFeeDetails] = useState({
    courseFee: '',
    paymentPlan: 'full',
    paymentPlanDetails: '',
    feeDueDate: '',
    sendReminder: true,
    numberOfInstallments: 1,
    installmentDayOfMonth: 15, // Day of month for installments (e.g., 15th)
  });
  const [accountingRemarks, setAccountingRemarks] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, statusFilter]);

  // Update URL when status filter changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (statusFilter === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', statusFilter);
    }
    setSearchParams(newParams, { replace: true });
  }, [statusFilter]);

  const fetchTasks = async () => {
    try {
      const data = await getAccountingTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    if (statusFilter === 'all') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(t => t.status === statusFilter));
    }
  };

  const handleViewTask = async (task) => {
    try {
      const fullTask = await getAccountingTask(task.id);
      setSelectedTask(fullTask);
      if (fullTask.feeDetails) {
        // Extract day of month from payment plan details if it exists
        let installmentDayOfMonth = 15; // Default
        if (fullTask.feeDetails.paymentPlanDetails) {
          const dayMatch = fullTask.feeDetails.paymentPlanDetails.match(/due on the (\d+)(?:st|nd|rd|th)/i);
          if (dayMatch) {
            installmentDayOfMonth = parseInt(dayMatch[1], 10);
          }
        }
        
        setFeeDetails({
          courseFee: fullTask.feeDetails.courseFee || '',
          paymentPlan: fullTask.feeDetails.paymentPlan || 'full',
          paymentPlanDetails: fullTask.feeDetails.paymentPlanDetails || '',
          feeDueDate: fullTask.feeDetails.feeDueDate || '',
          sendReminder: fullTask.feeDetails.sendReminder !== false,
          numberOfInstallments: fullTask.feeDetails.numberOfInstallments || 1,
          installmentDayOfMonth: fullTask.feeDetails.installmentDayOfMonth || installmentDayOfMonth,
        });
      }
      setAccountingRemarks(fullTask.accountingRemarks || '');
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await updateAccountingTask(taskId, { status });
      await fetchTasks();
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, status });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleSendToAdmin = async () => {
    if (!selectedTask) return;

    try {
      // Prepare fee details
      const feeData = {
        courseFee: feeDetails.courseFee ? parseFloat(feeDetails.courseFee) : null,
        paymentPlan: feeDetails.paymentPlan || null,
        paymentPlanDetails: feeDetails.paymentPlanDetails || null,
        feeDueDate: feeDetails.feeDueDate || null,
        sendReminder: feeDetails.sendReminder,
        numberOfInstallments: feeDetails.numberOfInstallments || null,
        installmentDayOfMonth: feeDetails.installmentDayOfMonth || null,
      };

      if (!feeData.courseFee || feeData.courseFee <= 0) {
        alert('Please enter a valid course fee before sending to admin.');
        return;
      }

      await sendTaskToAdmin(selectedTask.id, user.id, feeData, accountingRemarks);
      setShowModal(false);
      setSelectedTask(null);
      setAccountingRemarks('');
      await fetchTasks();
      alert('Task sent to admin for review successfully!');
    } catch (error) {
      console.error('Error sending task to admin:', error);
      alert('Failed to send task to admin. Please try again.');
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    try {
      // Prepare fee details
      const feeData = {
        courseFee: feeDetails.courseFee ? parseFloat(feeDetails.courseFee) : null,
        paymentPlan: feeDetails.paymentPlan || null,
        paymentPlanDetails: feeDetails.paymentPlanDetails || null,
        feeDueDate: feeDetails.feeDueDate || null,
        sendReminder: feeDetails.sendReminder,
        numberOfInstallments: feeDetails.numberOfInstallments || null,
        installmentDayOfMonth: feeDetails.installmentDayOfMonth || null,
      };

      await completeAccountingTask(selectedTask.id, user.id, feeData, accountingRemarks);
      setShowModal(false);
      setSelectedTask(null);
      setAccountingRemarks('');
      await fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task. Please try again.');
    }
  };

  const getDaySuffix = (day) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Fee Setup Tasks</h1>
        <p className="mt-2 text-sm text-slate-500">Manage student fee setup and configuration tasks</p>
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
          onClick={() => setStatusFilter('pending')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            statusFilter === 'pending'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Pending ({tasks.filter(t => t.status === 'pending').length})
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            statusFilter === 'in_progress'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          In Progress ({tasks.filter(t => t.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            statusFilter === 'completed'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Completed ({tasks.filter(t => t.status === 'completed').length})
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{task.description}</p>
                <div className="mt-4 flex items-center gap-6 text-sm text-slate-500">
                  <span>
                    <strong>Student:</strong> {task.studentFirstName} {task.studentLastName}
                  </span>
                  <span>
                    <strong>Email:</strong> {task.studentEmail}
                  </span>
                  <span>
                    <strong>Created:</strong> {formatDate(task.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {task.status !== 'completed' && (
                  <>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                      >
                        Start
                      </button>
                    )}
                    <button
                      onClick={() => handleViewTask(task)}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                    >
                      View Details
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-12 text-center">
            <p className="text-slate-500">No tasks found</p>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Task Details</h2>
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

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">Student Information</h3>
                <p className="text-slate-600">
                  {selectedTask.studentFirstName} {selectedTask.studentLastName}
                </p>
                <p className="text-sm text-slate-500">{selectedTask.studentEmail}</p>
                {selectedTask.studentPhone && (
                  <p className="text-sm text-slate-500">{selectedTask.studentPhone}</p>
                )}
                {selectedTask.studentData?.course && (
                  <p className="mt-2 text-sm text-indigo-600">
                    <svg className="mr-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Course: {selectedTask.studentData.course.title}
                  </p>
                )}
              </div>

              {selectedTask.adminRemarks && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <h4 className="mb-2 text-sm font-semibold text-blue-900">Admin Remarks</h4>
                  <p className="text-sm text-blue-700">{selectedTask.adminRemarks}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-slate-900">Fee Details</h3>
                <div className="mt-2 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Course Fee ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={feeDetails.courseFee}
                      onChange={(e) => {
                        const courseFee = e.target.value;
                        let details = feeDetails.paymentPlanDetails;
                        // Recalculate installment details if payment plan is installment
                        if (feeDetails.paymentPlan === 'installment' && courseFee && feeDetails.numberOfInstallments) {
                          const feeNum = parseFloat(courseFee) || 0;
                          const numInstallments = parseInt(feeDetails.numberOfInstallments, 10) || 1;
                          if (feeNum > 0 && numInstallments > 0) {
                            const installmentAmount = (feeNum / numInstallments).toFixed(2);
                            const dayOfMonth = feeDetails.installmentDayOfMonth || 15;
                            details = `${numInstallments} installments of $${installmentAmount} each, due on the ${dayOfMonth}${getDaySuffix(dayOfMonth)} of each month`;
                          }
                        }
                        setFeeDetails({ ...feeDetails, courseFee, paymentPlanDetails: details });
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                      placeholder="Enter course fee"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Payment Plan</label>
                    <select
                      value={feeDetails.paymentPlan}
                      onChange={(e) => setFeeDetails({ ...feeDetails, paymentPlan: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="full">Full Payment</option>
                      <option value="installment">Installment Plan</option>
                      <option value="scholarship">Scholarship</option>
                      <option value="waived">Fee Waived</option>
                    </select>
                  </div>
                  {feeDetails.paymentPlan === 'installment' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Number of Installments</label>
                        <input
                          type="number"
                          value={feeDetails.numberOfInstallments}
                          onChange={(e) => {
                            const numInstallments = parseInt(e.target.value) || 1;
                            const courseFee = parseFloat(feeDetails.courseFee) || 0;
                            let details = '';
                            if (numInstallments > 0 && courseFee > 0) {
                              const installmentAmount = (courseFee / numInstallments).toFixed(2);
                              const dayOfMonth = feeDetails.installmentDayOfMonth || 15;
                              details = `${numInstallments} installments of $${installmentAmount} each, due on the ${dayOfMonth}${getDaySuffix(dayOfMonth)} of each month`;
                            }
                            setFeeDetails({ 
                              ...feeDetails, 
                              numberOfInstallments: numInstallments,
                              paymentPlanDetails: details
                            });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                          min="1"
                          max="24"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Installment Due Day of Month</label>
                        <input
                          type="number"
                          value={feeDetails.installmentDayOfMonth}
                          onChange={(e) => {
                            const dayOfMonth = parseInt(e.target.value) || 15;
                            const numInstallments = parseInt(feeDetails.numberOfInstallments) || 1;
                            const courseFee = parseFloat(feeDetails.courseFee) || 0;
                            let details = '';
                            if (numInstallments > 0 && courseFee > 0) {
                              const installmentAmount = (courseFee / numInstallments).toFixed(2);
                              details = `${numInstallments} installments of $${installmentAmount} each, due on the ${dayOfMonth}${getDaySuffix(dayOfMonth)} of each month`;
                            }
                            setFeeDetails({ 
                              ...feeDetails, 
                              installmentDayOfMonth: Math.min(31, Math.max(1, dayOfMonth)),
                              paymentPlanDetails: details
                            });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                          min="1"
                          max="31"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          Installments will be due on this day of each month (e.g., 15th of every month)
                        </p>
                      </div>
                      {feeDetails.paymentPlanDetails && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                          <p className="text-xs font-semibold text-green-900">Payment Plan Summary:</p>
                          <p className="mt-1 text-sm text-green-700">{feeDetails.paymentPlanDetails}</p>
                        </div>
                      )}
                    </>
                  )}
                  {feeDetails.paymentPlan !== 'installment' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Fee Due Date</label>
                      <input
                        type="date"
                        value={feeDetails.feeDueDate}
                        onChange={(e) => setFeeDetails({ ...feeDetails, feeDueDate: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </div>
                  )}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={feeDetails.sendReminder}
                      onChange={(e) => setFeeDetails({ ...feeDetails, sendReminder: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <label className="ml-2 text-sm text-slate-700">Send payment reminders</label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">Accounting Remarks</h3>
                <textarea
                  rows="3"
                  value={accountingRemarks}
                  onChange={(e) => setAccountingRemarks(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Add any notes or remarks about the fee setup..."
                />
                <p className="mt-1 text-xs text-slate-500">These remarks will be visible to admin when reviewing</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTask(null);
                    setAccountingRemarks('');
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                {selectedTask.status !== 'completed' && selectedTask.status !== 'in_progress' && (
                  <button
                    onClick={handleSendToAdmin}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Send to Admin for Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingTasks;

