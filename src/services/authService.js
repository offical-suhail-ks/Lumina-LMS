import { supabase } from '../lib/supabase';
import api from './api';

export const login = async (username, password) => {
  const { data } = await api.post('/auth/login', { identifier: username, password });
  return data;
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
