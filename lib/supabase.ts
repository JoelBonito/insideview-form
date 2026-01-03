/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase URL ou Anon Key não configurados. Configure no arquivo .env');
}

// Cliente Supabase sem schema customizado (especificaremos nas queries)
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
