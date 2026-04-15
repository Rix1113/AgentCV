export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseAuth = Boolean(supabaseUrl && supabaseAnonKey);
export const hasSupabasePersistence = Boolean(supabaseUrl && supabaseServiceRoleKey);

export function assertSupabaseAuth() {
  if (!hasSupabaseAuth) {
    throw new Error("Supabase Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
}

export function assertSupabasePersistence() {
  if (!hasSupabasePersistence) {
    throw new Error("Supabase persistence is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
}
