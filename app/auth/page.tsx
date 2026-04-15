import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseAuth } from "@/lib/supabase/config";

export default async function AuthPage() {
  if (!hasSupabaseAuth) {
    return (
      <main>
        <Header />
        <section className="mx-auto max-w-2xl px-6 py-16">
          <div className="card p-6 text-slate-300">
            <h1 className="text-3xl font-bold text-white">Supabase Auth not configured</h1>
            <p className="mt-4">
              Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable sign-in.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main>
      <Header />
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-200">
            Secure workspace
          </p>
          <h1 className="max-w-2xl text-5xl font-black tracking-tight">Sign in to keep each application project private and persistent.</h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Supabase Auth protects the dashboard and ties every saved project to one account.
          </p>
        </div>
        <AuthForm />
      </section>
    </main>
  );
}
