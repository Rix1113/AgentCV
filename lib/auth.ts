import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { hasSupabaseAuth } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (!hasSupabaseAuth) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  if (!hasSupabaseAuth) {
    redirect("/auth");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  return user;
}

export async function requireApiUser() {
  if (!hasSupabaseAuth) {
    return {
      error: NextResponse.json({ error: "Supabase Auth is not configured" }, { status: 503 }),
      user: null,
    };
  }

  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }

  return { error: null, user };
}
