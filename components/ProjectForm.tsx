"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_UPLOAD_ACCEPT } from "@/lib/parsers/upload-config";

export function ProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("New Application Project");
  const [cvText, setCvText] = useState("");
  const [jobAdText, setJobAdText] = useState("");
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
        body: JSON.stringify({ projectId: project.id, cvText, jobAdText }),
      });
      if (!analyzeRes.ok) throw new Error(await readError(analyzeRes, "Analysis failed"));
      const { analysis } = await analyzeRes.json();

      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, cvText, jobAdText, analysis }),
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
      <div className="card p-6">
        <label className="mb-2 block text-sm font-semibold">Project title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-semibold">CV</label>
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
        <div className="card p-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-semibold">Job advertisement</label>
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
      <div className="flex items-center gap-3">
        <button className="button-primary" disabled={loading}>{loading ? "Generating..." : "Generate documents"}</button>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>
    </form>
  );
}
