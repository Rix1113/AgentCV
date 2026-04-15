import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { hasSupabaseAuth } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

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

export function isAdminEmail(email?: string | null) {
  return Boolean(email && adminEmails.includes(email.toLowerCase()));
}

export async function requireAdminUser() {
  const user = await requireUser();

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireAdminApiUser() {
  const { error, user } = await requireApiUser();
  if (error || !user) {
    return { error, user: null };
  }

  if (!isAdminEmail(user.email)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      user: null,
    };
  }

  return { error: null, user };
}
