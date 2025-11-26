import { supabase } from '../lib/supabase';

export const login = async (username, password) => {
  // Try to find user by username or email in users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .or(`username.eq.${username},email.eq.${username}`)
    .eq('password', password)
    .single();

  if (!userError && userData) {
    // User found in users table
    return {
      token: crypto.randomUUID(), // Generate a token
      user: {
        id: userData.id,
        name: userData.name,
        role: userData.role,
        email: userData.email,
        username: userData.username,
        department: userData.department || null,
      },
    };
  }

  // Try to find student by email
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select('id, email, first_name, last_name, password')
    .eq('email', username)
    .eq('password', password)
    .single();

  if (!studentError && studentData) {
    return {
      token: crypto.randomUUID(),
      user: {
        id: studentData.id,
        name: `${studentData.first_name} ${studentData.last_name}`,
        role: 'student',
        email: studentData.email,
        username: studentData.email,
        department: null,
      },
    };
  }

  throw new Error('Invalid credentials');
};

export const register = async (name, email, password) => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: crypto.randomUUID(),
      username: email.split('@')[0],
      name,
      email,
      password,
      role: 'student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const logout = async () => {
  // Clear Supabase session if using Supabase Auth
  await supabase.auth.signOut();
  return true;
};
