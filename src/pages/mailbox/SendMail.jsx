import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { listStudents } from '../../services/studentService';
import { sendMessage } from '../../services/mailboxService';
import api from '../../services/api';

const SendMail = () => {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [formData, setFormData] = useState({
    recipientId: '',
    recipientRole: '',
    recipientEmail: '',
    subject: '',
    body: '',
    isAnnouncement: false,
    announcementAudience: '',
  });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('personal'); // 'personal' or 'announcement'

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      const [studentsData, facultyData] = await Promise.all([
        listStudents(),
        api.get('/faculty').then(res => res.data).catch(() => []),
      ]);
      setStudents(studentsData);
      setFaculty(facultyData);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.body) {
      setMessage('Please fill in subject and message');
      return;
    }

    if (messageType === 'personal' && !formData.recipientId && !formData.recipientEmail) {
      setMessage('Please select a recipient or enter an email address');
      return;
    }

    if (messageType === 'announcement' && !formData.announcementAudience) {
      setMessage('Please select announcement audience');
      return;
    }

    setSending(true);
    setMessage('');

    try {
      const messageData = {
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        subject: formData.subject,
        body: formData.body,
        isAnnouncement: messageType === 'announcement',
      };

      if (messageType === 'personal') {
        if (formData.recipientId) {
          // Find recipient details
          const recipient = [...students, ...faculty].find(r => r.id === formData.recipientId);
          if (recipient) {
            messageData.recipientId = recipient.id;
            messageData.recipientRole = recipient.role || 'student';
          } else {
            messageData.recipientEmail = formData.recipientEmail;
          }
        } else {
          messageData.recipientEmail = formData.recipientEmail;
        }
      } else {
        messageData.announcementAudience = formData.announcementAudience;
      }

      await sendMessage(messageData);
      setMessage('Message sent successfully!');
      setTimeout(() => {
        navigate('/mailbox');
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage('Failed to send message. Please try again.');
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
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setMessageType('personal')}
            className={`px-4 py-2 rounded-xl font-semibold transition ${
              messageType === 'personal'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Personal Message
          </button>
          <button
            type="button"
            onClick={() => setMessageType('announcement')}
            className={`px-4 py-2 rounded-xl font-semibold transition ${
              messageType === 'announcement'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Announcement
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {messageType === 'personal' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">To *</label>
              <select
                value={formData.recipientId}
                onChange={(e) => setFormData({ ...formData, recipientId: e.target.value, recipientEmail: '' })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Select recipient</option>
                <optgroup label="Students">
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.email})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Faculty & Staff">
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.email}) - {f.role}
                    </option>
                  ))}
                </optgroup>
              </select>
              <p className="mt-2 text-xs text-slate-500">Or enter email manually:</p>
              <input
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value, recipientId: '' })}
                placeholder="recipient@example.com"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Announcement Audience *</label>
              <select
                value={formData.announcementAudience}
                onChange={(e) => setFormData({ ...formData, announcementAudience: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                required
              >
                <option value="">Select audience</option>
                <option value="all">All Users</option>
                <option value="students">All Students</option>
                <option value="faculty">All Faculty</option>
                <option value="parents">All Parents</option>
              </select>
            </div>
          )}

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
