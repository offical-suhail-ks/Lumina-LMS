import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getInbox, markAsRead, deleteMessage, markAllAsRead, getUnreadCount } from '../../services/mailboxService';

const Inbox = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [personalMessages, setPersonalMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'announcements'
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    if (user?.id && user?.role) {
      loadInbox();
      loadUnreadCount();
    }
  }, [user]);

  const loadInbox = async () => {
    if (!user?.id || !user?.role) return;

    try {
      setLoading(true);
      const inbox = await getInbox(user.id, user.role);
      setPersonalMessages(inbox.personal || []);
      setAnnouncements(inbox.announcements || []);
    } catch (error) {
      console.error('Error loading inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user?.id || !user?.role) return;

    try {
      const count = await getUnreadCount(user.id, user.role);
      setUnreadCount(count.total || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleViewMessage = async (message) => {
    try {
      await markAsRead(message.id, user.id);
      setSelectedMessage(message);
      await loadInbox();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error viewing message:', error);
      setSelectedMessage(message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await deleteMessage(messageId, user.id);
      await loadInbox();
      await loadUnreadCount();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(user.id);
      await loadInbox();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const messages = activeTab === 'personal' ? personalMessages : announcements;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Mailbox</h1>
            <p className="mt-2 text-sm text-slate-500">
              View and manage your messages and announcements.
            </p>
          </div>
          <Link
            to="/mailbox/send"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Mail
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === 'personal'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Personal ({personalMessages.filter(m => !m.isRead).length})
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === 'announcements'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Announcements ({announcements.length})
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              {unreadCount} unread
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-400"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading messages...</div>
        ) : selectedMessage ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedMessage(null)}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              ← Back to inbox
            </button>
            <div className="rounded-2xl border border-slate-200/70 bg-white/95 px-5 py-4 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">{selectedMessage.subject}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    From: {selectedMessage.senderName} ({selectedMessage.senderRole})
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedMessage.body}</p>
              </div>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.length > 0 ? (
              messages.map((mail) => (
                <li
                  key={mail.id}
                  className={`flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/95 px-5 py-4 shadow-sm transition hover:shadow-md cursor-pointer ${
                    !mail.isRead ? 'bg-indigo-50/50 border-indigo-200' : ''
                  }`}
                  onClick={() => handleViewMessage(mail)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {!mail.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                      <p className={`text-base font-semibold ${!mail.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                        {mail.senderName || 'System'}
                      </p>
                      {mail.isAnnouncement && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                          Announcement
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 text-sm ${!mail.isRead ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                      {mail.subject}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(mail.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(mail.id);
                      }}
                      className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-center py-8 text-slate-500">
                <p>No messages in your {activeTab === 'personal' ? 'inbox' : 'announcements'}</p>
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Inbox;
