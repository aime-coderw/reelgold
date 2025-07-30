import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xafezxfziuvdjhtzbbwh.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZmV6eGZ6aXV2ZGpodHpiYndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDcwMzgsImV4cCI6MjA2ODIyMzAzOH0.torCrn17XrNOvO3ok5Z7-ALfTjAA2Dg65YhJoeXAl7E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // keeps user logged in
    autoRefreshToken: true, // refresh token automatically
    detectSessionInUrl: true, // useful if handling OAuth
  },
});
