import Link from "next/link";
import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-200">Premium Estonian application writer</p>
            <h1 className="max-w-3xl text-5xl font-black tracking-tight">Turn a CV and a job ad into polished Estonian application materials.</h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">Generate a rewritten CV, motivational letter, and short and long professional statements, all tailored to the target role.</p>
            <div className="mt-8 flex gap-3">
              <Link href="/dashboard" className="button-primary">Start building</Link>
              <Link href="/history" className="button-secondary">View history</Link>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-bold">What the agent produces</h2>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li>Analüüs ja sobivuse kokkuvõte</li>
              <li>ATS-friendly rewritten CV</li>
              <li>Role-specific motivational letter</li>
              <li>Short and long enesetutvustus</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
