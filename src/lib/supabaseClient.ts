import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seeaubtexmusuccgdvkk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZWF1YnRleG11c3VjY2dkdmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODQ2MDcsImV4cCI6MjEwMTg2MDYwN30.FFDd-BtVB_4KafSve2cQAMbEDiozr_jDz_WqzUVqUsU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
