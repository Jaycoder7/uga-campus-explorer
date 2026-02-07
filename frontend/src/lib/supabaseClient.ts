import { createClient } from '@supabase/supabase-js';

// Grab these from your Supabase project settings
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Frontend client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Backend / service role client (optional, for server-side queries)
// export const supabaseAdmin = createClient(
//   SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_SERVICE_KEY // service role key, keep secret
// );
