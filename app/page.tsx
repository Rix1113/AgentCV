import Link from "next/link";
import { Header } from "@/components/Header";

const workflowSteps = [
  {
    title: "Upload source material",
    copy: "Drop in your existing CV and the target job ad, or paste text directly when you need a quick start.",
  },
  {
    title: "Generate tailored drafts",
    copy: "Create an Estonian CV rewrite, motivation letter, and concise profile statements in one pass.",
  },
  {
    title: "Review and refine",
    copy: "Edit section by section, regenerate weak spots, and compare saved versions without losing progress.",
  },
  {
    title: "Export and send",
    copy: "Download polished DOCX or PDF files once everything is ready for submission.",
  },
];

export default function HomePage() {
  return (
    <main>
      <Header />
      <section className="page-shell pt-16 sm:pt-20">
        <div className="panel-grid items-center gap-10">
          <div>
            <p className="eyebrow">Designed for focused applications</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
              Shape a sharper Estonian application from the material you already have.
            </h1>
            <p className="mt-6 max-w-2xl section-copy">
              A calm, polished workspace for uploading a CV and job ad, generating tailored drafts, reviewing each section,
              and exporting submission-ready files.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="button-primary">Start building</Link>
              <Link href="/history" className="button-secondary">View history</Link>
            </div>
            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
              <div className="card-muted p-4">
                <p className="text-sm font-semibold text-ink">Structured output</p>
                <p className="mt-2 text-sm text-muted">CV rewrite, letter, summary, and professional intro text.</p>
              </div>
              <div className="card-muted p-4">
                <p className="text-sm font-semibold text-ink">Fast iteration</p>
                <p className="mt-2 text-sm text-muted">Regenerate individual sections without redoing the whole project.</p>
              </div>
              <div className="card-muted p-4">
                <p className="text-sm font-semibold text-ink">Ready to export</p>
                <p className="mt-2 text-sm text-muted">Move from draft to DOCX or PDF when the application is final.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-12 top-6 h-40 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative card overflow-hidden p-6 sm:p-8">
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-accent/12 via-sky-200/40 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">Workflow preview</p>
                    <h2 className="mt-3 text-3xl font-semibold text-ink">One workspace, four clear stages</h2>
                  </div>
                  <span className="rounded-full bg-accentSoft px-4 py-2 text-sm font-semibold text-accent">Live draft</span>
                </div>

                <div className="mt-8 grid gap-4">
                  {workflowSteps.map((step, index) => (
                    <div key={step.title} className="card-muted flex gap-4 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-accent shadow-soft">
                        0{index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted">{step.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell pt-4">
        <div className="card overflow-hidden p-8 sm:p-10">
          <div>
            <p className="eyebrow">Built for the real workflow</p>
            <h2 className="mt-6 section-title">Upload, generate, review, and export without leaving the same flow.</h2>
            <p className="mt-5 section-copy">
              The interface is intentionally simple: clean prompts up front, roomy editing surfaces in the middle, and
              export controls where they matter. Everything supports the application process rather than distracting from it.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
