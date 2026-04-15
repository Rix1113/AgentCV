"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Mode = "sign-in" | "sign-up";

export function AuthForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "sign-up") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        setMessage("Account created. Check your email if your Supabase project requires confirmation, then sign in.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          throw signInError;
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-6 flex gap-2">
        <button className={mode === "sign-in" ? "button-primary" : "button-secondary"} onClick={() => setMode("sign-in")} type="button">
          Sign in
        </button>
        <button className={mode === "sign-up" ? "button-primary" : "button-secondary"} onClick={() => setMode("sign-up")} type="button">
          Create account
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-semibold">Email</label>
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Password</label>
          <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
        </div>
        <button className="button-primary" disabled={loading}>
          {loading ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </form>
    </div>
  );
}
