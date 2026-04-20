import { Header } from "@/components/Header";
import { ProjectForm } from "@/components/ProjectForm";

export default function DemoPage() {
  return (
    <main>
      <Header />
      <section className="page-shell">
        <div className="mb-8 max-w-3xl">
          <p className="eyebrow">Demo</p>
          <h1 className="mt-4 text-5xl font-semibold text-ink">Try the Estonian Job Agent</h1>
          <p className="mt-4 section-copy">
            Upload or paste your CV and the target job role to generate a tailored Estonian application draft. This demo allows one free generation.
          </p>
        </div>
        <ProjectForm demo={true} />
      </section>
    </main>
  );
}
