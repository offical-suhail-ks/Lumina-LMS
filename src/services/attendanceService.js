// Use import.meta.env for Vite (same pattern as api.js)
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// Get department students for faculty (only those with class today)
export const getDepartmentStudents = async (facultyId) => {
  try {
    const response = await fetch(`${API_URL}/attendance/department-students?facultyId=${facultyId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch department students' }));
      throw new Error(errorData.message || 'Failed to fetch department students');
    }
    return response.json();
  } catch (error) {
    console.error('Error in getDepartmentStudents:', error);
    throw error;
  }
};

// Get attendance by date
export const getAttendanceByDate = async (date, facultyId = null) => {
  let url = `${API_URL}/attendance?date=${date}`;
  if (facultyId) {
    url += `&facultyId=${facultyId}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch attendance');
  }
  return response.json();
};

// Mark attendance (single)
export const markAttendance = async (attendanceData) => {
  const response = await fetch(`${API_URL}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attendanceData),
  });
  if (!response.ok) {
    throw new Error('Failed to mark attendance');
  }
  return response.json();
};

// Mark bulk attendance
export const markBulkAttendance = async (attendanceList, facultyId, attendanceDate) => {
  const response = await fetch(`${API_URL}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      attendanceList,
      facultyId,
      attendanceDate,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to mark attendance');
  }
  return response.json();
};

// Get student attendance summary
export const getStudentAttendanceSummary = async (studentId) => {
  const response = await fetch(`${API_URL}/attendance/student/${studentId}/summary`);
  if (!response.ok) {
    throw new Error('Failed to fetch attendance summary');
  }
  return response.json();
};

// Get all attendance (admin view)
export const getAllAttendance = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.studentId) params.append('studentId', filters.studentId);
  if (filters.facultyId) params.append('facultyId', filters.facultyId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);
  
  const response = await fetch(`${API_URL}/attendance/all?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch attendance');
  }
  return response.json();
};

