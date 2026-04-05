import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase URL and anon key from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Prepare for future API calls
export const api = {
  // Example fetch function to get user profile
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },
};
