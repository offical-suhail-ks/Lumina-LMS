import { supabase } from '../lib/supabase';
import { createAccountingTask } from './accountingService';
import { getCourseDetails, courseExists } from './courseService';

// Helper function to convert camelCase to snake_case for database
const toSnakeCase = (obj) => {
  const snakeCaseMap = {
    firstName: 'first_name',
    lastName: 'last_name',
    dateOfBirth: 'date_of_birth',
    postalCode: 'postal_code',
    courseId: 'course_id',
    batchTiming: 'batch_timing',
    classSchedule: 'class_schedule',
    guardianName: 'guardian_name',
    guardianEmail: 'guardian_email',
    guardianPhone: 'guardian_phone',
  };

  // Helper to convert empty strings to null
  const nullIfEmpty = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return value;
  };

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'adminRemarks' || key === 'guardian') {
      // Skip these - they're handled separately
      continue;
    }
    const dbKey = snakeCaseMap[key] || key;
    // Convert empty strings to null for optional fields
    result[dbKey] = nullIfEmpty(value);
  }

  // Handle guardian object
  if (obj.guardian) {
    if (obj.guardian.name) result.guardian_name = nullIfEmpty(obj.guardian.name);
    if (obj.guardian.email) result.guardian_email = nullIfEmpty(obj.guardian.email);
    if (obj.guardian.phone) result.guardian_phone = nullIfEmpty(obj.guardian.phone);
  }

  return result;
};

// Helper function to convert snake_case to camelCase from database
const toCamelCase = (obj) => {
  if (!obj) return null;
  
  return {
    ...obj,
    firstName: obj.first_name,
    lastName: obj.last_name,
    dateOfBirth: obj.date_of_birth,
    postalCode: obj.postal_code,
    courseId: obj.course_id,
    batchTiming: obj.batch_timing,
    classSchedule: obj.class_schedule,
    guardianName: obj.guardian_name,
    guardianEmail: obj.guardian_email,
    guardianPhone: obj.guardian_phone,
    createdAt: obj.created_at,
    updatedAt: obj.updated_at,
    guardian: obj.guardian_name || obj.guardian_email || obj.guardian_phone ? {
      name: obj.guardian_name,
      email: obj.guardian_email,
      phone: obj.guardian_phone,
    } : null,
  };
};

export const listStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []).map(toCamelCase);
};

export const createStudent = async payload => {
  // Extract adminRemarks before converting
  const { adminRemarks, ...studentPayload } = payload;
  
  // Ensure username is set (default to email if not provided)
  const username = studentPayload.username || studentPayload.email;
  
  // Validate courseId exists if provided
  let validCourseId = null;
  let courseDetails = null;
  if (studentPayload.courseId && studentPayload.courseId !== '') {
    try {
      // First check if course exists (simpler check)
      const exists = await courseExists(studentPayload.courseId);
      if (exists) {
        validCourseId = studentPayload.courseId;
        // Only fetch full details if we need them for accounting task
        if (adminRemarks) {
          try {
            courseDetails = await getCourseDetails(studentPayload.courseId);
          } catch (error) {
            console.warn('Failed to fetch course details:', error);
            courseDetails = null;
          }
        }
      } else {
        console.warn(`Course ${studentPayload.courseId} not found, setting to null`);
        validCourseId = null;
      }
    } catch (error) {
      console.warn(`Error validating course ${studentPayload.courseId}:`, error);
      validCourseId = null;
      courseDetails = null;
    }
  }
  
  // Convert camelCase to snake_case
  const insertData = {
    id: crypto.randomUUID(),
    ...toSnakeCase({ ...studentPayload, courseId: validCourseId }),
    // Ensure email and username are included (email might be filtered out by toSnakeCase)
    email: studentPayload.email,
    username: username, // Required field - default to email
    // Ensure course_id is null if empty/invalid
    course_id: validCourseId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('students')
    .insert(insertData)
    .select()
    .single();
  
  if (error) {
    // Provide more specific error messages
    if (error.code === '23505') { // Unique violation
      if (error.message.includes('email')) {
        throw new Error('A student with this email already exists.');
      } else if (error.message.includes('username')) {
        throw new Error('A student with this username already exists.');
      } else {
        throw new Error('A student with this information already exists.');
      }
    } else if (error.code === '23503') { // Foreign key violation
      if (error.message.includes('course_id')) {
        throw new Error('The selected course does not exist. Please select a valid course or leave it empty.');
      } else {
        throw new Error('Invalid reference. Please check your input and try again.');
      }
    }
    throw error;
  }

  // Create accounting task if adminRemarks is provided
  if (adminRemarks && data) {
    try {
      // Use the already-fetched course details if available, otherwise fetch if needed
      let course = courseDetails;
      if (!course && validCourseId) {
        try {
          course = await getCourseDetails(validCourseId);
        } catch (error) {
          console.warn('Failed to fetch course details for accounting task:', error);
          course = null;
        }
      }
      
      await createAccountingTask({
        studentId: data.id,
        taskType: 'fee_setup',
        priority: 'high',
        title: `Fee Setup Required: ${data.first_name} ${data.last_name}`,
        description: `New student enrollment requires fee details to be set up. Student: ${data.first_name} ${data.last_name} (${data.email})${course ? `. Course: ${course.title}` : ''}`,
        studentData: {
          ...data,
          password: studentPayload.password, // Include password for offer letter generation later
          course: course ? { id: course.id, title: course.title } : null,
        },
        adminRemarks: adminRemarks || null,
      });
    } catch (error) {
      console.error('Failed to create accounting task:', error);
      // Continue even if task creation fails
    }
  }

  return toCamelCase(data);
};

export const updateStudent = async (studentId, payload) => {
  // Extract adminRemarks before converting
  const { adminRemarks, ...studentPayload } = payload;
  
  // Validate courseId exists if provided
  let validCourseId = null;
  if (studentPayload.courseId && studentPayload.courseId !== '') {
    try {
      const course = await getCourseDetails(studentPayload.courseId);
      if (course) {
        validCourseId = studentPayload.courseId;
      } else {
        console.warn(`Course ${studentPayload.courseId} not found, setting to null`);
        validCourseId = null;
      }
    } catch (error) {
      console.warn(`Error validating course ${studentPayload.courseId}:`, error);
      validCourseId = null;
    }
  }
  
  // Convert camelCase to snake_case
  const updatePayload = {
    ...toSnakeCase({ ...studentPayload, courseId: validCourseId }),
    // Ensure course_id is null if empty/invalid
    course_id: validCourseId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('students')
    .update(updatePayload)
    .eq('id', studentId)
    .select()
    .single();
  
  if (error) {
    // Provide more specific error messages
    if (error.code === '23503') { // Foreign key violation
      if (error.message.includes('course_id')) {
        throw new Error('The selected course does not exist. Please select a valid course or leave it empty.');
      } else {
        throw new Error('Invalid reference. Please check your input and try again.');
      }
    }
    throw error;
  }
  return toCamelCase(data);
};

export const deleteStudent = async studentId => {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId);
  
  if (error) throw error;
  return { success: true };
};

