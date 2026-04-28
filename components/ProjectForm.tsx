"use client";

import { ChangeEvent, useRef, useState } from "react";
import { FileText, FolderUp, Sparkles } from "lucide-react";
import { ResultsWorkspace } from "@/components/ResultsWorkspace";
import type { StoredDocuments } from "@/types";
import { useRouter } from "next/navigation";
import {
  CV_TEXT_MIN_LENGTH,
  formatCharacterCount,
  getRemainingCharacters,
  getTextInputLengthMessage,
  JOB_AD_TEXT_MIN_LENGTH,
  PROJECT_TITLE_MAX_LENGTH,
  TEXT_INPUT_LIMITS,
  TextInputField,
} from "@/lib/input-limits";
import { SUPPORTED_UPLOAD_ACCEPT } from "@/lib/parsers/upload-config";

export function ProjectForm({ demo = false }: { demo?: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("New Application Project");
  const [cvText, setCvText] = useState("");
  const [jobAdUrl, setJobAdUrl] = useState("");
  const [jobAdText, setJobAdText] = useState("");
  const [jobAdPreviewTitle, setJobAdPreviewTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<"cv" | "jobAd" | null>(null);
  const [fetchingJobAd, setFetchingJobAd] = useState(false);
  const [demoDocuments, setDemoDocuments] = useState<StoredDocuments | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cvFileInputRef = useRef<HTMLInputElement | null>(null);
  const jobAdFileInputRef = useRef<HTMLInputElement | null>(null);

  async function readError(response: Response, fallback: string) {
    try {
      const payload = await response.json();
      if (Array.isArray(payload.issues) && payload.issues.length > 0) {
        return payload.issues.map((issue: { message?: string }) => issue.message).filter(Boolean).join(" ");
      }

      return payload.error ?? fallback;
    } catch {
      return fallback;
    }
  }

  function validateTextField(field: TextInputField, value: string) {
    const limits = TEXT_INPUT_LIMITS[field];

    if (value.length < limits.min || value.length > limits.max) {
      return getTextInputLengthMessage(field);
    }

    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 2) {
      setError("Project title must be at least 2 characters.");
      return;
    }

    if (title.length > PROJECT_TITLE_MAX_LENGTH) {
      setError(`Project title must be ${formatCharacterCount(PROJECT_TITLE_MAX_LENGTH)} or less.`);
      return;
    }

    const cvError = validateTextField("cvText", cvText);
    if (cvError) {
      setError(cvError);
      return;
    }

    const jobAdError = validateTextField("jobAdText", jobAdText);
    if (jobAdError) {
      setError(jobAdError);
      return;
    }

    setLoading(true);
    try {
      let projectId;
      if (demo) {
        projectId = "demo";
      } else {
        const projectRes = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, cvText, jobAdText }),
        });

        if (!projectRes.ok) throw new Error(await readError(projectRes, "Failed to create project"));
        const project = await projectRes.json();
        projectId = project.id;
      }

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, cvText, jobAdText, demo }),
      });
      if (!analyzeRes.ok) throw new Error(await readError(analyzeRes, "Analysis failed"));
      const { analysis } = await analyzeRes.json();

      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, cvText, jobAdText, analysis, demo }),
      });
      if (!generateRes.ok) throw new Error(await readError(generateRes, "Generation failed"));
      const { documents } = await generateRes.json();

      if (demo) {
        setDemoDocuments(documents);
      } else {
        router.push(`/dashboard?projectId=${projectId}`);
        router.refresh();
      }
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
      formData.append("field", field === "cv" ? "cvText" : "jobAdText");

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

  async function onFetchJobAd() {
    const url = jobAdUrl.trim();
    if (!url) {
      setError("Paste a vacancy link first.");
      return;
    }

    setFetchingJobAd(true);
    setError(null);

    try {
      const response = await fetch("/api/fetch-job-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to fetch vacancy text");
      }

      setJobAdText(payload.text);
      setJobAdPreviewTitle(payload.title ?? null);

      if (payload.title && title === "New Application Project") {
        setTitle(payload.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setFetchingJobAd(false);
    }
  }

  const jobAdPreviewSnippet =
    jobAdText.length > 600 ? `${jobAdText.slice(0, 600).trimEnd()}...` : jobAdText;
  const jobAdPreviewHost = jobAdUrl.trim()
    ? (() => {
        try {
          return new URL(jobAdUrl.trim()).hostname.replace(/^www\./, "");
        } catch {
          return null;
        }
      })()
    : null;

  if (demoDocuments) {
    return <ResultsWorkspace project={{ id: "demo", userId: "demo", title: "Demo Project", cvText, jobAdText, documents: demoDocuments, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }} />;
  }

  const cvRemaining = getRemainingCharacters("cvText", cvText);
  const jobAdRemaining = getRemainingCharacters("jobAdText", jobAdText);
  const disableSubmit =
    loading ||
    fetchingJobAd ||
    uploadingField !== null ||
    title.trim().length < 2 ||
    title.length > PROJECT_TITLE_MAX_LENGTH ||
    cvText.length < CV_TEXT_MIN_LENGTH ||
    cvText.length > TEXT_INPUT_LIMITS.cvText.max ||
    jobAdText.length < JOB_AD_TEXT_MIN_LENGTH ||
    jobAdText.length > TEXT_INPUT_LIMITS.jobAdText.max;

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Project setup</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">Prepare the two texts that shape the whole application.</h2>
            <p className="mt-3 helper-text">
              Keep the workflow lightweight: define the project, add your source material, and let the generator create a structured first draft.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="metric-tile min-w-0 p-4">
              <FileText className="h-5 w-5 text-accent" />
              <p className="mt-3 text-sm font-semibold text-ink">Paste or upload</p>
            </div>
            <div className="metric-tile min-w-0 p-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <p className="mt-3 text-sm font-semibold text-ink">Generate drafts</p>
            </div>
            <div className="metric-tile min-w-0 p-4">
              <FolderUp className="h-5 w-5 text-accent" />
              <p className="mt-3 text-sm font-semibold text-ink">Export clean files</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="card p-6 sm:p-8">
          <label className="label">Project title</label>
          <input className="input" value={title} maxLength={PROJECT_TITLE_MAX_LENGTH} onChange={(e) => setTitle(e.target.value)} />
          <p className="mt-3 text-sm text-muted">Use a role or company name so the project stays easy to find later.</p>
        </div>
        <div className="card-muted p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Requirements</p>
          <p className="mt-3 text-sm leading-7 text-muted">Both fields are required before generation starts, and longer, cleaner source text usually produces stronger drafts.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <label className="label mb-1">CV</label>
              <p className="helper-text">
                Paste plain text or upload a supported file for parsing. Keep it between {formatCharacterCount(CV_TEXT_MIN_LENGTH)} and {formatCharacterCount(TEXT_INPUT_LIMITS.cvText.max)}.
              </p>
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
          <textarea
            className="textarea"
            value={cvText}
            maxLength={TEXT_INPUT_LIMITS.cvText.max}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste CV text here..."
          />
          <p className={`mt-3 text-sm ${cvRemaining < 300 ? "text-amber-700" : "text-muted"}`}>
            {formatCharacterCount(cvText.length)} used, {formatCharacterCount(cvRemaining)} remaining.
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <label className="label mb-1">Job advertisement</label>
              <p className="helper-text">
                Include responsibilities, expectations, and keywords from the posting. Keep it between {formatCharacterCount(JOB_AD_TEXT_MIN_LENGTH)} and {formatCharacterCount(TEXT_INPUT_LIMITS.jobAdText.max)}.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="button-secondary text-sm"
                onClick={() => jobAdFileInputRef.current?.click()}
                disabled={loading || fetchingJobAd || uploadingField !== null}
              >
                {uploadingField === "jobAd" ? "Parsing..." : "Upload PDF/DOCX"}
              </button>
            </div>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              className="input"
              type="url"
              value={jobAdUrl}
              onChange={(e) => setJobAdUrl(e.target.value)}
              placeholder="Paste a vacancy link, for example CV-Online or company careers page..."
            />
            <button
              type="button"
              className="button-secondary"
              onClick={() => void onFetchJobAd()}
              disabled={loading || fetchingJobAd || uploadingField !== null}
            >
              {fetchingJobAd ? "Fetching..." : "Fetch from link"}
            </button>
          </div>
          <p className="mb-4 text-sm text-muted">
            The app will pull the readable job-ad text into the field below so you can review it before generation.
          </p>
          {jobAdText ? (
            <div className="mb-4 rounded-[28px] border border-slate-200/80 bg-slate-50/90 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Imported preview</p>
                  <p className="mt-2 text-base font-semibold text-ink">
                    {jobAdPreviewTitle ?? "Fetched job advertisement"}
                  </p>
                </div>
                <p className="text-sm text-muted">
                  {jobAdPreviewHost ? `${jobAdPreviewHost} • ` : ""}
                  {formatCharacterCount(jobAdText.length)}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
                {jobAdPreviewSnippet}
              </p>
            </div>
          ) : null}
          <input
            ref={jobAdFileInputRef}
            type="file"
            accept={SUPPORTED_UPLOAD_ACCEPT}
            className="hidden"
            onChange={(event) => void onFileSelected("jobAd", event)}
          />
          <textarea
            className="textarea"
            value={jobAdText}
            maxLength={TEXT_INPUT_LIMITS.jobAdText.max}
            onChange={(e) => setJobAdText(e.target.value)}
            placeholder="Paste job ad here..."
          />
          <p className={`mt-3 text-sm ${jobAdRemaining < 300 ? "text-amber-700" : "text-muted"}`}>
            {formatCharacterCount(jobAdText.length)} used, {formatCharacterCount(jobAdRemaining)} remaining.
          </p>
        </div>
      </div>

      <div className="hero-panel p-6 sm:p-8">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-ink">Ready to generate the first draft?</p>
            <p className="mt-1 helper-text">You’ll move straight into the review workspace once generation finishes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="button-primary" disabled={disableSubmit}>{loading ? "Generating..." : "Generate documents"}</button>
          </div>
        </div>
      </div>

      {error ? (
        <div>
          <div className="status-panel border-rose-200 bg-rose-50/95 text-rose-700">
            {error}
          </div>
        </div>
      ) : null}
    </form>
  );
}
