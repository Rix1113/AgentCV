import { Header } from "@/components/Header";

export default function SettingsPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-bold">Settings</h1>
        <div className="card p-6 text-slate-300">
          <p>Planned settings areas:</p>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>Account and authentication</li>
            <li>Billing and plan limits</li>
            <li>Default export preferences</li>
            <li>Data retention and privacy controls</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
