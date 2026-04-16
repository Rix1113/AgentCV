"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthStatus({ email }: { email?: string }) {
  const router = useRouter();

  async function onSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  if (!email) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 text-sm text-muted">
      <span className="hidden sm:inline">{email}</span>
      <button className="button-secondary" onClick={onSignOut} type="button">
        Sign out
      </button>
    </div>
  );
}
