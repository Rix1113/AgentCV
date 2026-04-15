import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border/80 bg-black/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold">Estonian Job Agent</Link>
        <nav className="flex gap-4 text-sm text-slate-300">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/history">History</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </div>
    </header>
  );
}
