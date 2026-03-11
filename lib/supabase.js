import { createClient } from '@supabase/supabase-js';

// Supabase Project URL
const supabaseUrl = 'https://vngnailtloleapnpayft.supabase.co';

// Supabase Anon Key (new format - not JWT)
// This key is safe to use in client-side code
const supabaseAnonKey = 'sb_publishable_Twrf2QSeCb8hemhA9S3MLg_b-FXSM21';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
export const BUCKET_NAME = 'al-italy-store';

