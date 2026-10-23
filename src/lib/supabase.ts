import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://spjpyrrudvlrhzochapf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * `true` solo si hay URL y anon key reales. Si es `false`, la sincronización
 * falla de forma explícita (sin borrar el borrador local).
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co'
);

// `createClient` lanza si la key está vacía; se usa un placeholder para que la app
// arranque (en modo sin sincronización) aunque falten las variables de entorno.
export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'missing-anon-key');
