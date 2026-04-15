import Link from "next/link";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { AuthStatus } from "@/components/AuthStatus";

export async function Header() {
  const user = await getCurrentUser().catch(() => null);
  const isAdmin = isAdminEmail(user?.email);

  return (
    <header className="border-b border-border/80 bg-black/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold">Estonian Job Agent</Link>
        <div className="flex items-center gap-4">
          <nav className="flex gap-4 text-sm text-slate-300">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/history">History</Link>
            <Link href="/settings">Settings</Link>
            {isAdmin ? <Link href="/admin">Admin</Link> : null}
            {!user ? <Link href="/auth">Sign in</Link> : null}
          </nav>
          <AuthStatus email={user?.email} />
        </div>
      </div>
    </header>
  );
}
