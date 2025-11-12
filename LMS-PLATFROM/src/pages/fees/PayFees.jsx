import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPaymentSummary, processPayment } from '../../services/paymentService';

const PayFees = () => {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const installmentNumber = searchParams.get('installment');

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Payment form state
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    if (user?.id && user?.role === 'student') {
      fetchPaymentSummary();
    }
  }, [user?.id]);

  const fetchPaymentSummary = async () => {
    try {
      const data = await getPaymentSummary(user.id);
      setSummary(data);

      // Pre-fill amount if paying specific installment
      if (installmentNumber && data.installments) {
        const installment = data.installments.find((inst) => inst.number === parseInt(installmentNumber, 10));
        if (installment && installment.status === 'pending') {
          setAmount(installment.amount.toString());
        }
      } else if (data.remainingAmount > 0) {
        // Pre-fill with remaining amount if no specific installment
        setAmount(data.remainingAmount.toString());
      }
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      setError('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    }
    return v;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setProcessing(true);

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setProcessing(false);
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 13) {
      setError('Please enter a valid card number');
      setProcessing(false);
      return;
    }

    if (!cardHolder.trim()) {
      setError('Please enter card holder name');
      setProcessing(false);
      return;
    }

    if (expiryDate.length !== 5) {
      setError('Please enter a valid expiry date (MM/YY)');
      setProcessing(false);
      return;
    }

    if (cvv.length < 3) {
      setError('Please enter a valid CVV');
      setProcessing(false);
      return;
    }

    try {
      // Find installment info if paying specific installment
      let installmentNum = null;
      let totalInstallments = null;
      if (installmentNumber && summary?.installments) {
        const installment = summary.installments.find((inst) => inst.number === parseInt(installmentNumber, 10));
        if (installment) {
          installmentNum = installment.number;
          totalInstallments = summary.installments.length;
        }
      }

      const result = await processPayment({
        studentId: user.id,
        amount: parseFloat(amount),
        installmentNumber: installmentNum,
        totalInstallments: totalInstallments,
        paymentMethod: 'card',
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolder: cardHolder.trim(),
        expiryDate: expiryDate,
        cvv: cvv,
      });

      if (result.success) {
        setSuccess(true);
        // Reset form
        setCardNumber('');
        setCardHolder('');
        setExpiryDate('');
        setCvv('');
        // Refresh summary
        setTimeout(() => {
          fetchPaymentSummary();
          setTimeout(() => {
            navigate('/fees');
          }, 2000);
        }, 1500);
      } else {
        setError(result.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">Loading payment information...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">No payment information available.</div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Make Payment</h1>
        <p className="mt-2 text-sm text-slate-500">Pay your course fees securely</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Fee:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(summary.totalFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Paid Amount:</span>
                <span className="font-semibold text-emerald-600">{formatCurrency(summary.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Remaining:</span>
                <span className="font-semibold text-amber-600">{formatCurrency(summary.remainingAmount)}</span>
              </div>
              {installmentNumber && summary.installments && (
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Paying Installment</p>
                  <p className="text-sm font-semibold text-slate-900">
                    #{installmentNumber} of {summary.installments.length}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mock Payment Info */}
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold text-amber-900 mb-2">💡 Mock Payment Gateway</p>
            <p className="text-xs text-amber-700">
              This is a mock payment system. Use a card number ending in an <strong>even digit</strong> (0, 2, 4, 6, 8) for
              successful payment. Any other number will simulate a failed payment.
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
            <div className="space-y-5">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount to Pay</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={summary.remainingAmount}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={processing}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Maximum: {formatCurrency(summary.remainingAmount)}</p>
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
                <input
                  type="text"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  required
                  disabled={processing}
                />
              </div>

              {/* Card Holder */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Card Holder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                  disabled={processing}
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="MM/YY"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    required
                    disabled={processing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CVV</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="123"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={processing}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-semibold text-rose-700">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-700">Payment processed successfully! Redirecting...</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing || success}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {processing ? 'Processing Payment...' : success ? 'Payment Successful!' : `Pay ${formatCurrency(parseFloat(amount) || 0)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PayFees;
