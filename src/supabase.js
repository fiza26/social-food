import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from '@/supabaseConfig';

let supabase;

// const supabase = createClient(supabaseUrl, supabaseKey);

if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export default supabase;