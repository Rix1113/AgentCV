import { createClient } from "@supabase/supabase-js";
import { assertSupabasePersistence, supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase/config";

let adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdminClient() {
  assertSupabasePersistence();

  if (!adminClient) {
    adminClient = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
