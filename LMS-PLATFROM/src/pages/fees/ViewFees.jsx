import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getPaymentSummary } from '../../services/paymentService';

const ViewFees = () => {
  const user = useSelector(state => state.auth.user);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && user?.role === 'student') {
      fetchPaymentSummary();
    }
  }, [user?.id]);

  const fetchPaymentSummary = async () => {
    try {
      const data = await getPaymentSummary(user.id);
      setSummary(data);
    } catch (error) {
      console.error('Error fetching payment summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">Loading fee information...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">No fee information available.</div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Fee Management</h1>
        <p className="mt-2 text-sm text-slate-500">View your fee details and payment history</p>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-indigo-500 to-indigo-400 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Total Fee</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(summary.totalFee)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-emerald-500 to-emerald-400 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Paid Amount</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(summary.paidAmount)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-amber-500 to-orange-400 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Remaining</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(summary.remainingAmount)}</p>
        </div>
      </div>

      {/* Payment Plan Info */}
      {summary.paymentPlan && (
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Plan</h2>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Plan Type:</span>{' '}
              <span className="capitalize">{summary.paymentPlan}</span>
            </p>
            {summary.paymentPlanDetails && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Details:</span> {summary.paymentPlanDetails}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Installments */}
      {summary.installments && summary.installments.length > 0 && (
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Installments</h2>
            {summary.remainingAmount > 0 && (
              <Link
                to="/fees/pay"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Pay Now
              </Link>
            )}
          </div>
          <div className="space-y-3">
            {summary.installments.map((installment, idx) => (
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
                    {summary.installments.length > 1 && ` of ${summary.installments.length}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Amount: {formatCurrency(installment.amount)}
                    {installment.paidAt && ` • Paid on ${formatDate(installment.paidAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      installment.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {installment.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                  {installment.status === 'pending' && summary.remainingAmount > 0 && (
                    <Link
                      to={`/fees/pay?installment=${installment.number}`}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Pay
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Payment History */}
      {summary.paymentHistory && summary.paymentHistory.length > 0 && (
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Installment</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Method</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {summary.paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-600">{formatDate(payment.paidAt || payment.createdAt)}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-900">{formatCurrency(payment.amount)}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {payment.installmentNumber
                        ? `#${payment.installmentNumber}${payment.totalInstallments ? ` of ${payment.totalInstallments}` : ''}`
                        : 'Full Payment'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 capitalize">{payment.paymentMethod || 'Card'}</td>
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
                    <td className="py-3 px-4 text-xs text-slate-500 font-mono">{payment.transactionId || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {summary.remainingAmount > 0 && (
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6 text-center">
          <p className="text-sm font-semibold text-indigo-900 mb-2">
            You have {formatCurrency(summary.remainingAmount)} remaining to pay
          </p>
          <Link
            to="/fees/pay"
            className="inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Make Payment
          </Link>
        </div>
      )}
    </div>
  );
};

export default ViewFees;
