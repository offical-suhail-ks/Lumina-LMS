import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { listCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '../../services/calendarService';
import { listAssignments } from '../../services/assignmentService';

const CalendarView = () => {
  const user = useSelector(state => state.auth.user);
  const [events, setEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', eventDate: '', eventTime: '', assignmentId: '' });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchEvents();
    fetchAssignments();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await listCalendarEvents();
      console.log('Fetched events:', data);
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); // Set empty array on error
    }
  };

  const fetchAssignments = async () => {
    try {
      const data = await listAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = events.filter(e => {
      const eventDate = e.eventDate;
      if (!eventDate) return false;
      if (typeof eventDate === 'string') {
        return eventDate === dateStr || eventDate.split('T')[0] === dateStr;
      }
      if (eventDate instanceof Date) {
        return eventDate.toISOString().split('T')[0] === dateStr;
      }
      return false;
    });
    console.log('Date clicked:', dateStr, 'Events found:', dayEvents);
    setSelectedDate(date);
    setSelectedEvents(dayEvents);
    setShowEventModal(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.eventDate) {
      alert('Please fill in title and date');
      return;
    }

    try {
      // Ensure date is in YYYY-MM-DD format
      const eventDate = formData.eventDate;
      const eventTime = formData.eventTime || null;
      
      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        eventDate: eventDate,
        eventTime: eventTime,
        assignmentId: formData.assignmentId || null,
      };

      console.log('Creating event with payload:', payload);
      const result = await createCalendarEvent(payload);
      console.log('Event created successfully:', result);
      
      // Refresh events list
      await fetchEvents();
      
      // Close modal and reset form
      setShowCreateModal(false);
      setFormData({ title: '', description: '', eventDate: '', eventTime: '', assignmentId: '' });
      
      // Show success message
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create event';
      alert(`Failed to create event: ${errorMessage}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteCalendarEvent(eventId);
        await fetchEvents();
        const dateStr = selectedDate.toISOString().split('T')[0];
        setSelectedEvents(events.filter(e => e.id !== eventId && e.eventDate === dateStr));
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    // Handle both date formats (YYYY-MM-DD string or Date object)
    const matchingEvents = events.filter(e => {
      const eventDate = e.eventDate;
      if (!eventDate) return false;
      // If it's already a string in YYYY-MM-DD format
      if (typeof eventDate === 'string') {
        return eventDate === dateStr || eventDate.split('T')[0] === dateStr;
      }
      // If it's a Date object
      if (eventDate instanceof Date) {
        return eventDate.toISOString().split('T')[0] === dateStr;
      }
      return false;
    });
    return matchingEvents;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Events Calendar</h1>
            <p className="mt-2 text-sm text-slate-500">
              Click on any date to view events. {user?.role === 'admin' && 'Create events from assignments.'}
            </p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Create Event
            </button>
          )}
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Previous
          </button>
          <h2 className="text-xl font-semibold text-slate-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Next →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-slate-500">
              {day}
            </div>
          ))}
          {days.map((date, index) => {
            const dateEvents = getEventsForDate(date);
            return (
              <button
                key={index}
                onClick={() => date && handleDateClick(date)}
                disabled={!date}
                className={`relative min-h-[80px] rounded-xl border p-2 text-left transition hover:bg-slate-50 ${
                  !date
                    ? 'border-transparent'
                    : isToday(date)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {date && (
                  <>
                    <span
                      className={`text-sm font-semibold ${
                        isToday(date) ? 'text-indigo-600' : 'text-slate-900'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {dateEvents.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {dateEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="truncate rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700"
                          >
                            {event.title}
                          </div>
                        ))}
                        {dateEvents.length > 2 && (
                          <div className="text-xs text-slate-500">+{dateEvents.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {selectedEvents.length > 0 ? (
                selectedEvents.map(event => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                        {event.description && (
                          <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                        )}
                        {event.eventTime && (
                          <p className="mt-1 text-xs text-slate-500">Time: {event.eventTime}</p>
                        )}
                      </div>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No events on this date</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Create Event</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link to Assignment (Optional)</label>
                <select
                  value={formData.assignmentId}
                  onChange={(e) => setFormData({ ...formData, assignmentId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2"
                >
                  <option value="">None</option>
                  {assignments.map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
                >
                  Create Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
