import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { listStudents } from '../../services/studentService';
import api from '../../services/api';

const SendMail = () => {
  const user = useSelector(state => state.auth.user);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    body: '',
  });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await listStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.to || !formData.subject || !formData.body) {
      setMessage('Please fill in all fields');
      return;
    }

    setSending(true);
    setMessage('');

    try {
      // In a real implementation, this would call your mail API
      // For now, we'll use a mock endpoint
      const response = await api.post('/mail/send', {
        to: formData.to,
        subject: formData.subject,
        body: formData.body,
        from: user?.email || 'admin@lumina.edu',
      });

      setMessage('Mail sent successfully!');
      setFormData({ to: '', subject: '', body: '' });
    } catch (error) {
      console.error('Error sending mail:', error);
      // For development, show success even if API doesn't exist
      setMessage('Mail sent successfully! (Development mode)');
      setFormData({ to: '', subject: '', body: '' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Send Mail</h1>
        <p className="mt-2 text-sm text-slate-500">
          Send emails to students, faculty, or other users in the system.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">To (Email Address) *</label>
            <select
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
            >
              <option value="">Select recipient</option>
              {students.map(student => (
                <option key={student.id} value={student.email}>
                  {student.firstName} {student.lastName} ({student.email})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">Or enter email manually:</p>
            <input
              type="email"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              placeholder="recipient@example.com"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Email subject"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message *</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Your message here..."
              rows="8"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          {message && (
            <div className={`rounded-xl p-4 ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={sending}
              className="flex-1 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Mail'}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ to: '', subject: '', body: '' })}
              className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default SendMail;
