import React, { useEffect, useState } from 'react';
import { getPaymentSummary, sendPaymentReminder } from '../../services/paymentService';
import { listStudents } from '../../services/studentService';

const ManageFees = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        student =>
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const data = await listStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFees = async (student) => {
    setSelectedStudent(student);
    setLoadingSummary(true);
    try {
      const summary = await getPaymentSummary(student.id);
      setPaymentSummary(summary);
    } catch (error) {
      console.error('Error fetching payment summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSendReminder = async () => {
    if (!selectedStudent) return;
    
    setSendingReminder(true);
    try {
      await sendPaymentReminder(selectedStudent.id);
      alert('Payment reminder sent successfully!');
      // Refresh payment summary
      await handleViewFees(selectedStudent);
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send payment reminder. Please try again.');
    } finally {
      setSendingReminder(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Fee Management</h1>
        <p className="mt-2 text-sm text-slate-500">View and manage student fees and payments</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student List */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Students</h2>
            
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Student List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleViewFees(student)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                      selectedStudent?.id === student.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{student.email}</p>
                    {student.studentId && (
                      <p className="text-xs text-slate-400 mt-1">ID: {student.studentId}</p>
                    )}
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No students found</p>
              )}
            </div>
          </div>
        </div>

        {/* Fee Details */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="space-y-6">
              {loadingSummary ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-12 text-center">
                  <div className="text-slate-500">Loading fee information...</div>
                </div>
              ) : paymentSummary ? (
                <>
                  {/* Student Info */}
                  <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h2>
                      {paymentSummary && paymentSummary.remainingAmount > 0 && selectedStudent.feeDueDate && (
                        <button
                          onClick={handleSendReminder}
                          disabled={sendingReminder}
                          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingReminder ? 'Sending...' : 'Send Reminder'}
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Fee</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {formatCurrency(paymentSummary.totalFee)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paid Amount</p>
                        <p className="mt-2 text-2xl font-semibold text-emerald-600">
                          {formatCurrency(paymentSummary.paidAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remaining</p>
                        <p className="mt-2 text-2xl font-semibold text-amber-600">
                          {formatCurrency(paymentSummary.remainingAmount)}
                        </p>
                      </div>
                    </div>
                    {selectedStudent.feeDueDate && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {formatDate(selectedStudent.feeDueDate)}
                        </p>
                        {(() => {
                          const daysUntilDue = Math.ceil((new Date(selectedStudent.feeDueDate) - new Date()) / (1000 * 60 * 60 * 24));
                          if (daysUntilDue < 0) {
                            return <p className="mt-1 text-xs font-semibold text-rose-600">Overdue by {Math.abs(daysUntilDue)} days</p>;
                          } else if (daysUntilDue <= 3) {
                            return <p className="mt-1 text-xs font-semibold text-amber-600">Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}</p>;
                          } else {
                            return <p className="mt-1 text-xs text-slate-500">{daysUntilDue} days remaining</p>;
                          }
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Payment Plan */}
                  {paymentSummary.paymentPlan && (
                    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Plan</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Plan Type:</span>{' '}
                          <span className="capitalize">{paymentSummary.paymentPlan}</span>
                        </p>
                        {paymentSummary.paymentPlanDetails && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Details:</span> {paymentSummary.paymentPlanDetails}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Installments */}
                  {paymentSummary.installments && paymentSummary.installments.length > 0 && (
                    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Installments</h3>
                      <div className="space-y-3">
                        {paymentSummary.installments.map((installment, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                              installment.status === 'paid'
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">
                                Installment {installment.number}
                                {paymentSummary.installments.length > 1 &&
                                  ` of ${paymentSummary.installments.length}`}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Amount: {formatCurrency(installment.amount)}
                                {installment.paidAt && ` • Paid on ${formatDate(installment.paidAt)}`}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                installment.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {installment.status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment History */}
                  {paymentSummary.paymentHistory && paymentSummary.paymentHistory.length > 0 && (
                    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment History</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">
                                Date
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">
                                Amount
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">
                                Installment
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">
                                Method
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">
                                Status
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">
                                Transaction ID
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentSummary.paymentHistory.map((payment) => (
                              <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-sm text-slate-600">
                                  {formatDate(payment.paidAt || payment.createdAt)}
                                </td>
                                <td className="py-3 px-4 text-sm font-semibold text-slate-900">
                                  {formatCurrency(payment.amount)}
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600">
                                  {payment.installmentNumber
                                    ? `#${payment.installmentNumber}${payment.totalInstallments ? ` of ${payment.totalInstallments}` : ''}`
                                    : 'Full Payment'}
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600 capitalize">
                                  {payment.paymentMethod || 'Card'}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                      payment.paymentStatus === 'completed'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : payment.paymentStatus === 'pending'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-rose-100 text-rose-700'
                                    }`}
                                  >
                                    {payment.paymentStatus}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                                  {payment.transactionId || 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {paymentSummary.totalFee === 0 && (
                    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur text-center">
                      <p className="text-slate-500">No fee information available for this student.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur text-center">
                  <p className="text-slate-500">No fee information available for this student.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur text-center">
              <p className="text-slate-500">Select a student to view their fee information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageFees;

