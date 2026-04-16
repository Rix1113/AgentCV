import Link from "next/link";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { AuthStatus } from "@/components/AuthStatus";

export async function Header() {
  const user = await getCurrentUser().catch(() => null);
  const isAdmin = isAdminEmail(user?.email);

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-sky-400 text-sm font-bold text-white shadow-soft">
            EJ
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">Estonian Job Agent</p>
            <p className="text-sm text-ink">Tailored materials, refined fast</p>
          </div>
        </Link>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:justify-end">
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link href="/dashboard" className="button-ghost">Dashboard</Link>
            <Link href="/history" className="button-ghost">History</Link>
            <Link href="/settings" className="button-ghost">Settings</Link>
            {isAdmin ? <Link href="/admin" className="button-ghost">Admin</Link> : null}
            {!user ? <Link href="/auth" className="button-ghost">Sign in</Link> : null}
          </nav>
          <AuthStatus email={user?.email} />
        </div>
      </div>
    </header>
  );
}
