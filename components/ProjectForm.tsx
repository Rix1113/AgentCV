"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_UPLOAD_ACCEPT } from "@/lib/parsers/upload-config";

export function ProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("New Application Project");
  const [cvText, setCvText] = useState("");
  const [jobAdText, setJobAdText] = useState("");
  const [model, setModel] = useState("gpt-5.4-mini");
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<"cv" | "jobAd" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cvFileInputRef = useRef<HTMLInputElement | null>(null);
  const jobAdFileInputRef = useRef<HTMLInputElement | null>(null);

  async function readError(response: Response, fallback: string) {
    try {
      const payload = await response.json();
      return payload.error ?? fallback;
    } catch {
      return fallback;
    }
  }

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

      if (!projectRes.ok) throw new Error(await readError(projectRes, "Failed to create project"));
      const project = await projectRes.json();

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, cvText, jobAdText, model }),
      });
      if (!analyzeRes.ok) throw new Error(await readError(analyzeRes, "Analysis failed"));
      const { analysis } = await analyzeRes.json();

      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, cvText, jobAdText, analysis, model }),
      });
      if (!generateRes.ok) throw new Error(await readError(generateRes, "Generation failed"));

      router.push(`/dashboard?projectId=${project.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function onFileSelected(field: "cv" | "jobAd", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingField(field);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to parse uploaded file");
      }

      if (field === "cv") {
        setCvText(payload.text);
      } else {
        setJobAdText(payload.text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploadingField(null);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">Project setup</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Name the application and prepare your source material.</h2>
            <p className="mt-3 helper-text">
              Keep the workflow lightweight: add a project title, bring in your CV and the job ad, then choose the model for generation.
            </p>
          </div>
          <div className="card-muted px-4 py-3 text-sm text-muted">
            Upload or paste into both fields before generating.
          </div>
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <label className="label">Project title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <label className="label mb-1">CV</label>
              <p className="helper-text">Paste plain text or upload a supported file for parsing.</p>
            </div>
            <button
              type="button"
              className="button-secondary text-sm"
              onClick={() => cvFileInputRef.current?.click()}
              disabled={loading || uploadingField !== null}
            >
              {uploadingField === "cv" ? "Parsing..." : "Upload PDF/DOCX"}
            </button>
          </div>
          <input
            ref={cvFileInputRef}
            type="file"
            accept={SUPPORTED_UPLOAD_ACCEPT}
            className="hidden"
            onChange={(event) => void onFileSelected("cv", event)}
          />
          <textarea className="textarea" value={cvText} onChange={(e) => setCvText(e.target.value)} placeholder="Paste CV text here..." />
        </div>

        <div className="card p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <label className="label mb-1">Job advertisement</label>
              <p className="helper-text">Include responsibilities, expectations, and keywords from the posting.</p>
            </div>
            <button
              type="button"
              className="button-secondary text-sm"
              onClick={() => jobAdFileInputRef.current?.click()}
              disabled={loading || uploadingField !== null}
            >
              {uploadingField === "jobAd" ? "Parsing..." : "Upload PDF/DOCX"}
            </button>
          </div>
          <input
            ref={jobAdFileInputRef}
            type="file"
            accept={SUPPORTED_UPLOAD_ACCEPT}
            className="hidden"
            onChange={(event) => void onFileSelected("jobAd", event)}
          />
          <textarea className="textarea" value={jobAdText} onChange={(e) => setJobAdText(e.target.value)} placeholder="Paste job ad here..." />
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <label className="label">ChatGPT version</label>
            <p className="mb-3 helper-text">Choose the model that matches the speed and quality tradeoff you want for this project.</p>
            <select className="input" value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="gpt-5.4-mini">GPT-5.4 mini</option>
              <option value="gpt-5.4">GPT-5.4</option>
              <option value="gpt-5">GPT-5</option>
            </select>
          </div>
          <div className="card-muted p-5">
            <p className="text-sm font-semibold text-ink">What happens next</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              The app creates a project, analyzes your fit, and generates tailored documents before opening the review workspace.
            </p>
          </div>
        </div>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
        <div>
          <p className="text-lg font-semibold text-ink">Ready to generate the first draft?</p>
          <p className="mt-1 helper-text">You’ll be taken straight into the review workspace once generation finishes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="button-primary" disabled={loading}>{loading ? "Generating..." : "Generate documents"}</button>
        </div>
      </div>

      {error ? (
        <div className="card border-rose-200 bg-rose-50/90 p-5 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </form>
  );
}
