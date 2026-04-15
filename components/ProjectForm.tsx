"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("New Application Project");
  const [cvText, setCvText] = useState("");
  const [jobAdText, setJobAdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const projectRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, cvText, jobAdText }),
      });

      if (!projectRes.ok) throw new Error("Failed to create project");
      const project = await projectRes.json();

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, cvText, jobAdText }),
      });
      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const { analysis } = await analyzeRes.json();

      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, cvText, jobAdText, analysis }),
      });
      if (!generateRes.ok) throw new Error("Generation failed");

      router.push(`/dashboard?projectId=${project.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="card p-6">
        <label className="mb-2 block text-sm font-semibold">Project title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <label className="mb-2 block text-sm font-semibold">CV</label>
          <textarea className="textarea" value={cvText} onChange={(e) => setCvText(e.target.value)} placeholder="Paste CV text here..." />
        </div>
        <div className="card p-6">
          <label className="mb-2 block text-sm font-semibold">Job advertisement</label>
          <textarea className="textarea" value={jobAdText} onChange={(e) => setJobAdText(e.target.value)} placeholder="Paste job ad here..." />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="button-primary" disabled={loading}>{loading ? "Generating..." : "Generate documents"}</button>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>
    </form>
  );
}
