import { supabase } from '../lib/supabase';

// Helper function to transform snake_case to camelCase
const transformCourseToCamelCase = (course) => {
  if (!course) return null;
  return {
    ...course,
    startDate: course.start_date,
    endDate: course.end_date,
    totalYears: course.total_years,
    createdAt: course.created_at,
    updatedAt: course.updated_at,
  };
};

export const listCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []).map(transformCourseToCamelCase);
};

// Simple function to check if a course exists
export const courseExists = async (courseId) => {
  if (!courseId) return false;
  
  const { data, error } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .maybeSingle();
  
  if (error) {
    // If error is "not found", return false, otherwise throw
    if (error.code === 'PGRST116') return false;
    throw error;
  }
  
  return !!data;
};

export const getCourseDetails = async (courseId) => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      course_modules (*),
      course_enrollments (
        student_id,
        students:student_id (
          id,
          first_name,
          last_name,
          email
        )
      )
    `)
    .eq('id', courseId)
    .maybeSingle(); // Use maybeSingle instead of single to return null if not found
  
  if (error) {
    // If course not found, return null instead of throwing
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  if (!data) return null;
  
  // Transform snake_case to camelCase
  return transformCourseToCamelCase(data);
};

export const createCourse = async course => {
  // Transform camelCase to snake_case for database
  const insertData = {
    id: crypto.randomUUID(),
    title: course.title,
    description: course.description,
    instructor: course.instructor,
    department: course.department || null,
    start_date: course.startDate || course.start_date || null,
    end_date: course.endDate || course.end_date || null,
    total_years: course.totalYears || course.total_years || null,
    capacity: course.capacity || 30,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('courses')
    .insert(insertData)
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform snake_case back to camelCase for frontend
  return transformCourseToCamelCase(data);
};

export const updateCourse = async (courseId, course) => {
  // Transform camelCase to snake_case for database
  const updatePayload = {
    updated_at: new Date().toISOString(),
  };
  
  if (course.title !== undefined) updatePayload.title = course.title;
  if (course.description !== undefined) updatePayload.description = course.description;
  if (course.instructor !== undefined) updatePayload.instructor = course.instructor;
  if (course.department !== undefined) updatePayload.department = course.department;
  if (course.startDate !== undefined) updatePayload.start_date = course.startDate;
  if (course.endDate !== undefined) updatePayload.end_date = course.endDate;
  if (course.totalYears !== undefined) updatePayload.total_years = course.totalYears;
  if (course.capacity !== undefined) updatePayload.capacity = course.capacity;

  const { data, error } = await supabase
    .from('courses')
    .update(updatePayload)
    .eq('id', courseId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform snake_case back to camelCase for frontend
  return transformCourseToCamelCase(data);
};

export const deleteCourse = async courseId => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);
  
  if (error) throw error;
  return { success: true };
};

export const enrollInCourse = async (courseId, studentId) => {
  const { data, error } = await supabase
    .from('course_enrollments')
    .insert({
      id: crypto.randomUUID(),
      course_id: courseId,
      student_id: studentId,
      enrolled_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const unenrollFromCourse = async (courseId, studentId) => {
  const { error } = await supabase
    .from('course_enrollments')
    .delete()
    .eq('course_id', courseId)
    .eq('student_id', studentId);
  
  if (error) throw error;
  return { success: true };
};

export const getStudentCourses = async (studentId) => {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select(`
      *,
      courses (*)
    `)
    .eq('student_id', studentId);
  
  if (error) throw error;
  return (data || []).map(enrollment => transformCourseToCamelCase(enrollment.courses));
};