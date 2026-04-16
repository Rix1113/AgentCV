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
        <section className="page-shell max-w-2xl py-16">
          <div className="card p-6 text-muted">
            <h1 className="text-3xl font-semibold text-ink">Supabase Auth not configured</h1>
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
      <section className="page-shell grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="eyebrow">Secure workspace</p>
          <h1 className="mt-6 max-w-2xl text-5xl font-semibold text-ink sm:text-6xl">Sign in to keep each application project private and persistent.</h1>
          <p className="mt-6 max-w-2xl section-copy">
            Supabase Auth protects the dashboard and ties every saved project to one account.
          </p>
        </div>
        <AuthForm />
      </section>
    </main>
  );
}
