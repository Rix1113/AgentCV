"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseAuth, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    assertSupabaseAuth();
    browserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }

  return browserClient;
}
