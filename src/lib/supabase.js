import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not set. Using fallback to API.');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'http://localhost:4000', // Fallback to API if not configured
  supabaseAnonKey || 'fallback-key'
);

export default supabase;

