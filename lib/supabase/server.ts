import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertSupabaseAuth, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export async function getSupabaseServerClient() {
  assertSupabaseAuth();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components can read auth cookies even when they cannot write them.
        }
      },
    },
  });
}
