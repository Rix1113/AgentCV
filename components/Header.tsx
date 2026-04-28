import Link from "next/link";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { AuthStatus } from "@/components/AuthStatus";

export async function Header() {
  const user = await getCurrentUser().catch(() => null);
  const isAdmin = isAdminEmail(user?.email);

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <Link href="/" className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-gradient-to-br from-accent via-sky-500 to-cyan-400 text-sm font-bold text-white shadow-soft">
            EJ
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">Estonian Job Agent</p>
            <p className="text-sm text-ink">Editorial application drafts for serious job searches</p>
          </div>
        </Link>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:justify-end">
          <nav className="flex flex-wrap gap-2 rounded-full border border-white/80 bg-white/70 p-1 text-sm shadow-soft backdrop-blur">
            <Link href="/dashboard" className="nav-pill hover:bg-white/80 hover:text-ink">Dashboard</Link>
            <Link href="/history" className="nav-pill hover:bg-white/80 hover:text-ink">History</Link>
            <Link href="/settings" className="nav-pill hover:bg-white/80 hover:text-ink">Settings</Link>
            {isAdmin ? <Link href="/admin" className="nav-pill hover:bg-white/80 hover:text-ink">Admin</Link> : null}
            {!user ? <Link href="/auth" className="nav-pill nav-pill-active">Sign in</Link> : null}
          </nav>
          <AuthStatus email={user?.email} />
        </div>
      </div>
    </header>
  );
}
