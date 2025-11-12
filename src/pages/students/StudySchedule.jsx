import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { listAssignments } from '../../services/assignmentService';
import { listCourses } from '../../services/courseService';
import { listCalendarEvents } from '../../services/calendarService';

const StudySchedule = () => {
  const user = useSelector(state => state.auth.user);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, month
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsData, coursesData, eventsData] = await Promise.all([
        listAssignments(),
        listCourses(),
        listCalendarEvents(),
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getDayItems = (date) => {
    const items = [];
    const dateStr = date.toISOString().split('T')[0];
    
    // Assignments due on this date
    assignments.forEach(assignment => {
      if (assignment.dueDate) {
        const dueDate = new Date(assignment.dueDate).toISOString().split('T')[0];
        if (dueDate === dateStr) {
          items.push({
            type: 'assignment',
            title: assignment.title,
            time: new Date(assignment.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            courseId: assignment.courseId,
            id: assignment.id,
          });
        }
      }
    });
    
    // Calendar events on this date
    events.forEach(event => {
      if (event.eventDate === dateStr) {
        items.push({
          type: 'event',
          title: event.title,
          time: event.eventTime || 'All Day',
          description: event.description,
          id: event.id,
        });
      }
    });
    
    return items.sort((a, b) => {
      if (a.time === 'All Day') return 1;
      if (b.time === 'All Day') return -1;
      return a.time.localeCompare(b.time);
    });
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const weekDates = getWeekDates();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Study Schedule</h1>
            <p className="mt-2 text-sm text-slate-500">
              Plan your week with assignments, deadlines, and events.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateWeek(-1)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Next →
            </button>
          </div>
        </div>
      </header>

      {/* Week View */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
            {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const dayItems = getDayItems(date);
            
            return (
              <div
                key={index}
                className={`rounded-2xl border p-3 min-h-[200px] ${
                  isToday
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="mb-2">
                  <p className={`text-xs font-semibold uppercase ${
                    isToday ? 'text-indigo-600' : 'text-slate-500'
                  }`}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className={`text-lg font-bold ${
                    isToday ? 'text-indigo-900' : 'text-slate-900'
                  }`}>
                    {date.getDate()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {dayItems.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`text-xs p-2 rounded-lg ${
                        item.type === 'assignment'
                          ? 'bg-rose-50 border border-rose-200'
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-slate-600 text-[10px] mt-1">{item.time}</p>
                      {item.type === 'assignment' && (
                        <p className="text-indigo-600 text-[10px] mt-1 truncate">
                          {getCourseName(item.courseId)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming Deadlines */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Deadlines</h2>
        <div className="space-y-3">
          {assignments
            .filter(a => {
              if (!a.dueDate) return false;
              const due = new Date(a.dueDate);
              return due >= new Date();
            })
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5)
            .map(assignment => {
              const due = new Date(assignment.dueDate);
              const now = new Date();
              const diffTime = due - now;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{assignment.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {getCourseName(assignment.courseId)} • {due.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      diffDays <= 1 ? 'text-rose-600' :
                      diffDays <= 3 ? 'text-amber-600' :
                      'text-slate-600'
                    }`}>
                      {diffDays === 0 ? 'Today' :
                       diffDays === 1 ? 'Tomorrow' :
                       `${diffDays} days`}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default StudySchedule;

