import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getDepartmentStudents, markBulkAttendance, getAttendanceByDate } from '../../services/attendanceService';

const TakeAttendance = () => {
  const user = useSelector(state => state.auth.user);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [user?.id, selectedDate]);

  const fetchData = async () => {
    if (!user?.id) {
      console.error('User ID not found');
      setMessage({ type: 'error', text: 'User information not available. Please log in again.' });
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      const [studentsData, attendanceData] = await Promise.all([
        getDepartmentStudents(user.id),
        getAttendanceByDate(selectedDate, user.id),
      ]);
      
      setStudents(studentsData);
      
      // Create a map of existing attendance
      const attendanceMap = {};
      attendanceData.forEach(att => {
        attendanceMap[att.studentId] = att.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error.message || 'Failed to load students';
      if (errorMessage.includes('department')) {
        setMessage({ 
          type: 'error', 
          text: 'Failed to load students. Please ensure: 1) You have a department assigned, 2) Students are enrolled in courses from your department, 3) Students have active status.' 
        });
      } else {
        setMessage({ type: 'error', text: `Error: ${errorMessage}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      setMessage(null);
      
      // Prepare attendance list
      const attendanceList = studentsWithClassToday.map(student => ({
        studentId: student.id,
        status: attendance[student.id] || 'absent',
        notes: null,
      }));
      
      await markBulkAttendance(attendanceList, user.id, selectedDate);
      
      setMessage({ type: 'success', text: 'Attendance marked successfully!' });
      
      // Refresh data
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setMessage({ type: 'error', text: 'Failed to save attendance. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Helper function to check if today is a class day based on schedule
  const isClassDayToday = (scheduleType) => {
    if (!scheduleType) return false;
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    switch (scheduleType.toLowerCase()) {
      case 'daily':
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'weekend':
        return dayOfWeek === 0 || dayOfWeek === 6;
      case 'mwf':
        return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
      case 'tts':
        return dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6;
      default:
        return false;
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  
  // Filter students who have class today (only if today's date is selected)
  const studentsWithClassToday = isToday 
    ? students.filter(student => {
        if (!student.classSchedule) return true; // Show students without schedule
        return isClassDayToday(student.classSchedule);
      })
    : students; // Show all students for past dates

  const hasClassToday = studentsWithClassToday.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Take Attendance</h1>
          <p className="mt-1 text-sm text-slate-600">
            Mark attendance for students in your department
          </p>
        </div>
      </div>

      {/* Date Selection */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        {!isToday && (
          <p className="mt-2 text-xs text-amber-600">
            You can only mark attendance for today's date if there is a class scheduled.
          </p>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-xl border p-4 ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Students List */}
      {!hasClassToday && isToday ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mt-2 text-sm font-medium text-amber-800">
            No classes scheduled for today
          </p>
          <p className="mt-1 text-xs text-amber-600">
            There are no students with classes scheduled for today based on their class schedule.
            {students.length > 0 && (
              <span className="block mt-2">
                Total students in your department: {students.length}
              </span>
            )}
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <div className="space-y-2">
            <p className="text-slate-700 font-medium">No students found in your department.</p>
            <p className="text-sm text-slate-500">
              This could be because:
            </p>
            <ul className="text-sm text-slate-500 text-left max-w-md mx-auto mt-2 space-y-1">
              <li>• You don't have a department assigned</li>
              <li>• No students are enrolled in courses from your department</li>
              <li>• Students don't have active status</li>
            </ul>
          </div>
        </div>
      ) : studentsWithClassToday.length === 0 && !isToday ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-500">No students found for this date.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Students ({studentsWithClassToday.length})
                    {students.length > studentsWithClassToday.length && (
                      <span className="text-xs font-normal text-slate-500 ml-2">
                        ({students.length} total in department)
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    {selectedDate === new Date().toISOString().split('T')[0]
                      ? "Today's class"
                      : `Class on ${new Date(selectedDate).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || !isToday}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                    saving || !isToday
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Attendance
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {studentsWithClassToday.map((student) => (
                <div
                  key={student.id}
                  className="px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-slate-600">
                        <span>{student.email}</span>
                        {student.courseTitle && (
                          <span className="flex items-center gap-1">
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            {student.courseTitle}
                          </span>
                        )}
                        {student.batchTiming && (
                          <span className="capitalize">{student.batchTiming} batch</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          attendance[student.id] === 'present'
                            ? 'bg-green-100 text-green-700 border-2 border-green-500'
                            : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-green-50'
                        }`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          attendance[student.id] === 'absent' || !attendance[student.id]
                            ? 'bg-red-100 text-red-700 border-2 border-red-500'
                            : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-red-50'
                        }`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Absent
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          attendance[student.id] === 'late'
                            ? 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                            : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-amber-50'
                        }`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Late
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'excused')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          attendance[student.id] === 'excused'
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                            : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-blue-50'
                        }`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Excused
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isToday && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> You can only mark attendance for today's date if there is a class scheduled.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TakeAttendance;

