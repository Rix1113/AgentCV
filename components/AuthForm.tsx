"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Mode = "sign-in" | "sign-up" | "forgot-password" | "reset-password";

export function AuthForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncRecoveryModeFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hasResetMode = searchParams.get("mode") === "reset-password";
      const hasRecoveryType = searchParams.get("type") === "recovery" || hashParams.get("type") === "recovery";
      const hasRecoveryToken =
        searchParams.has("token_hash") || searchParams.has("code") || hashParams.has("access_token") || hashParams.has("refresh_token");

      if (hasResetMode || hasRecoveryType || hasRecoveryToken) {
        setMode("reset-password");
        setMessage("Choose a new password for your account.");
        setError(null);
      }
    };

    syncRecoveryModeFromUrl();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset-password");
        setMessage("Choose a new password for your account.");
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  function resetFeedback() {
    setError(null);
    setMessage(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    resetFeedback();

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
      } else if (mode === "forgot-password") {
        const redirectTo = `${window.location.origin}/auth?mode=reset-password`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

        if (resetError) {
          throw resetError;
        }

        setMessage("Password reset link sent. Check your email and follow the link to choose a new password.");
      } else if (mode === "reset-password") {
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
          throw updateError;
        }

        await supabase.auth.signOut();
        setMode("sign-in");
        setPassword("");
        setMessage("Password updated. You can now sign in with your new password.");
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/auth");
        }
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
    <div className="card p-6 sm:p-8">
      <div className="mb-6 flex gap-2">
        <button
          className={mode === "sign-in" || mode === "forgot-password" || mode === "reset-password" ? "button-primary" : "button-secondary"}
          onClick={() => {
            setMode("sign-in");
            resetFeedback();
          }}
          type="button"
        >
          Sign in
        </button>
        <button
          className={mode === "sign-up" ? "button-primary" : "button-secondary"}
          onClick={() => {
            setMode("sign-up");
            resetFeedback();
          }}
          type="button"
        >
          Create account
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={mode === "reset-password"}
          />
        </div>
        {mode !== "forgot-password" ? (
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
            {mode === "sign-in" ? (
              <p className="mt-2 text-sm text-slate-400">
                <button
                  className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-900"
                  onClick={() => {
                    setMode("forgot-password");
                    resetFeedback();
                  }}
                  type="button"
                >
                  Forgot your password?
                </button>
              </p>
            ) : null}
            {mode === "reset-password" ? (
              <p className="mt-2 text-sm text-slate-400">Use at least 6 characters. Once saved, you can sign in normally again.</p>
            ) : null}
          </div>
        ) : null}
        <button className="button-primary" disabled={loading}>
          {loading
            ? "Working..."
            : mode === "sign-in"
              ? "Sign in"
              : mode === "sign-up"
                ? "Create account"
                : mode === "forgot-password"
                  ? "Send reset link"
                  : "Save new password"}
        </button>
        {mode === "forgot-password" ? (
          <p className="text-sm text-slate-400">
            Enter your account email and we will send you a Supabase password reset link.
          </p>
        ) : null}
        {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      </form>
    </div>
  );
}
