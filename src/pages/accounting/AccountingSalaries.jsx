import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getSalaries,
  getSalary,
  createSalary,
  updateSalary,
  getSalaryPayments,
  createSalaryPayment,
  updateSalaryPayment,
} from '../../services/accountingService';
import { listFaculty } from '../../services/facultyService';

const AccountingSalaries = () => {
  const user = useSelector(state => state.auth.user);
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeType: 'faculty',
    baseSalary: '',
    allowances: '0',
    deductions: '0',
    paymentFrequency: 'monthly',
    bankAccount: '',
    bankName: '',
    taxId: '',
    startDate: '',
    endDate: '',
    status: 'active',
    notes: '',
  });
  const [paymentData, setPaymentData] = useState({
    paymentDate: '',
    amount: '',
    paymentMethod: 'bank_transfer',
    transactionReference: '',
    notes: '',
  });

  useEffect(() => {
    fetchSalaries();
    fetchFaculty();
  }, []);

  useEffect(() => {
    filterSalaries();
  }, [salaries, statusFilter]);

  const fetchSalaries = async () => {
    try {
      const data = await getSalaries();
      setSalaries(data);
    } catch (error) {
      console.error('Error fetching salaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const data = await listFaculty();
      setFacultyList(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const filterSalaries = () => {
    if (statusFilter === 'all') {
      setFilteredSalaries(salaries);
    } else {
      setFilteredSalaries(salaries.filter(s => s.status === statusFilter));
    }
  };

  const handleViewSalary = async (salary) => {
    try {
      const fullSalary = await getSalary(salary.id);
      const salaryPayments = await getSalaryPayments(salary.id);
      setSelectedSalary(fullSalary);
      setPayments(salaryPayments);
      setFormData({
        employeeId: fullSalary.employeeId,
        employeeType: fullSalary.employeeType,
        baseSalary: fullSalary.baseSalary,
        allowances: fullSalary.allowances || '0',
        deductions: fullSalary.deductions || '0',
        paymentFrequency: fullSalary.paymentFrequency,
        bankAccount: fullSalary.bankAccount || '',
        bankName: fullSalary.bankName || '',
        taxId: fullSalary.taxId || '',
        startDate: fullSalary.startDate,
        endDate: fullSalary.endDate || '',
        status: fullSalary.status,
        notes: fullSalary.notes || '',
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching salary details:', error);
    }
  };

  const handleCreateSalary = async () => {
    try {
      await createSalary({
        ...formData,
        baseSalary: parseFloat(formData.baseSalary),
        allowances: parseFloat(formData.allowances),
        deductions: parseFloat(formData.deductions),
        createdBy: user.id,
      });
      setShowModal(false);
      resetForm();
      await fetchSalaries();
    } catch (error) {
      console.error('Error creating salary:', error);
      alert('Failed to create salary. Please try again.');
    }
  };

  const handleUpdateSalary = async () => {
    if (!selectedSalary) return;

    try {
      await updateSalary(selectedSalary.id, {
        ...formData,
        baseSalary: parseFloat(formData.baseSalary),
        allowances: parseFloat(formData.allowances),
        deductions: parseFloat(formData.deductions),
      });
      setShowModal(false);
      setSelectedSalary(null);
      await fetchSalaries();
    } catch (error) {
      console.error('Error updating salary:', error);
      alert('Failed to update salary. Please try again.');
    }
  };

  const handleCreatePayment = async () => {
    if (!selectedSalary) return;

    try {
      await createSalaryPayment(selectedSalary.id, {
        ...paymentData,
        amount: parseFloat(paymentData.amount),
        processedBy: user.id,
      });
      setShowPaymentModal(false);
      setPaymentData({
        paymentDate: '',
        amount: '',
        paymentMethod: 'bank_transfer',
        transactionReference: '',
        notes: '',
      });
      await handleViewSalary(selectedSalary);
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      employeeType: 'faculty',
      baseSalary: '',
      allowances: '0',
      deductions: '0',
      paymentFrequency: 'monthly',
      bankAccount: '',
      bankName: '',
      taxId: '',
      startDate: '',
      endDate: '',
      status: 'active',
      notes: '',
    });
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">Loading salaries...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Salary Management</h1>
          <p className="mt-2 text-sm text-slate-500">Manage employee salaries and payments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setSelectedSalary(null);
            setShowModal(true);
          }}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Add Salary
        </button>
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
          All ({salaries.length})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            statusFilter === 'active'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Active ({salaries.filter(s => s.status === 'active').length})
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            statusFilter === 'inactive'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Inactive ({salaries.filter(s => s.status === 'inactive').length})
        </button>
      </div>

      {/* Salaries List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSalaries.map((salary) => {
          const employee = facultyList.find(f => f.id === salary.employeeId);
          return (
            <div
              key={salary.id}
              className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {employee ? employee.name : `Employee ${salary.employeeId}`}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 capitalize">{salary.employeeType}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Base Salary:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(salary.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Net Salary:</span>
                      <span className="font-semibold text-indigo-600">{formatCurrency(salary.netSalary)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Frequency:</span>
                      <span className="text-slate-700 capitalize">{salary.paymentFrequency}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(salary.status)}`}>
                      {salary.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleViewSalary(salary)}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
        {filteredSalaries.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200/80 bg-white/80 p-12 text-center">
            <p className="text-slate-500">No salaries found</p>
          </div>
        )}
      </div>

      {/* Salary Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">
                {selectedSalary ? 'Edit Salary' : 'Create Salary'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSalary(null);
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
                <label className="block text-sm font-medium text-slate-700">Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  disabled={!!selectedSalary}
                >
                  <option value="">Select employee</option>
                  {facultyList.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name} ({faculty.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Employee Type</label>
                <select
                  value={formData.employeeType}
                  onChange={(e) => setFormData({ ...formData, employeeType: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Base Salary ($)</label>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Allowances ($)</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Deductions ($)</label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Payment Frequency</label>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Bank Account</label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Bank name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">End Date (optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              {selectedSalary && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="mb-4 font-semibold text-slate-900">Payment History</h3>
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-slate-500">{formatDate(payment.paymentDate)}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            payment.status === 'processed'
                              ? 'bg-green-100 text-green-700'
                              : payment.status === 'pending'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <p className="text-center text-sm text-slate-500">No payments yet</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setPaymentData({
                        paymentDate: new Date().toISOString().split('T')[0],
                        amount: selectedSalary.netSalary,
                        paymentMethod: 'bank_transfer',
                        transactionReference: '',
                        notes: '',
                      });
                      setShowPaymentModal(true);
                    }}
                    className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                  >
                    Add Payment
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedSalary(null);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedSalary ? handleUpdateSalary : handleCreateSalary}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  {selectedSalary ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedSalary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Add Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Payment Date</label>
                <input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Amount ($)</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Payment Method</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Transaction Reference</label>
                <input
                  type="text"
                  value={paymentData.transactionReference}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  rows="3"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePayment}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  Create Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingSalaries;

