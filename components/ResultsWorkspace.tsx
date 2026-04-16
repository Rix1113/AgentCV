"use client";

import { useMemo, useState } from "react";
import { DOCUMENT_SECTION_KEYS, type DocumentSectionKey, type DocumentVersionSource, type Project } from "@/types";
import { DOCUMENT_SECTION_LABELS, normalizeStoredDocuments } from "@/lib/documents";

const tabs = DOCUMENT_SECTION_KEYS.map((key) => ({
  key,
  label: DOCUMENT_SECTION_LABELS[key],
}));

const sourceLabels: Record<DocumentVersionSource, string> = {
  initial_generation: "Initial",
  regenerated: "Regenerated",
  manual_edit: "Saved edit",
  restored: "Restored",
};

export function ResultsWorkspace({ project }: { project: Project }) {
  const [activeTab, setActiveTab] = useState<DocumentSectionKey>("analysis_summary_et");
  const [content, setContent] = useState(() => normalizeStoredDocuments(project.documents!, project.updatedAt));
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [exporting, setExporting] = useState<"docx" | "pdf" | null>(null);
  const activeLabel = useMemo(() => tabs.find((tab) => tab.key === activeTab)?.label ?? "Document", [activeTab]);
  const activeHistory = useMemo(() => [...(content._history?.[activeTab] ?? [])].reverse(), [activeTab, content]);

  async function copyCurrent() {
    await navigator.clipboard.writeText(content[activeTab]);
    setStatus(`${activeLabel} copied.`);
  }

  async function persistDocuments(
    nextContent = content,
    changeSources?: Partial<Record<DocumentSectionKey, "manual_edit" | "restored">>
  ) {
    setSaving(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/projects`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          documents: DOCUMENT_SECTION_KEYS.reduce((acc, key) => {
            acc[key] = nextContent[key];
            return acc;
          }, {} as Record<DocumentSectionKey, string>),
          changeSources,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save changes");
      }

      setContent(normalizeStoredDocuments(payload.documents, payload.updatedAt));
      setStatus("Changes saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function exportFile(kind: "docx" | "pdf") {
    setExporting(kind);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch(`/api/export/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, documents: content }),
      });
      const contentType = res.headers.get("Content-Type") ?? "";

      if (!res.ok) {
        let message = `Failed to export ${kind.toUpperCase()}.`;

        if (contentType.includes("application/json")) {
          const payload = (await res.json()) as { error?: string; retryAfterSeconds?: number };
          message = payload.error ?? message;

          if (typeof payload.retryAfterSeconds === "number" && payload.retryAfterSeconds > 0) {
            message = `${message} Try again in ${payload.retryAfterSeconds} seconds.`;
          }
        } else {
          const text = await res.text();
          if (text.trim()) {
            message = text;
          }
        }

        throw new Error(message);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filename = disposition.match(/filename=\"([^\"]+)\"/)?.[1] ?? `estonian-job-agent.${kind}`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      setStatus(`${kind.toUpperCase()} exported.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to export ${kind.toUpperCase()}.`);
    } finally {
      setExporting(null);
    }
  }

  async function regenerateActiveSection() {
    setRegenerating(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          section: activeTab,
          cvText: project.cvText,
          jobAdText: project.jobAdText,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to regenerate section");
      }

      setContent(normalizeStoredDocuments(payload.project.documents, payload.project.updatedAt));
      setStatus(`${activeLabel} regenerated.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate section");
    } finally {
      setRegenerating(false);
    }
  }

  async function restoreVersion(versionId: string) {
    const version = content._history?.[activeTab]?.find((entry) => entry.id === versionId);
    if (!version) {
      return;
    }

    const next = {
      ...content,
      [activeTab]: version.content,
    };
    setContent(next);
    setStatus(`${activeLabel} restored from history.`);
    setError(null);

    await persistDocuments(next, { [activeTab]: "restored" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="card p-6 sm:p-8">
        <div className="mb-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">Review workspace</p>
              <h1 className="mt-3 text-4xl font-semibold text-ink">Refine each document section before export.</h1>
              <p className="mt-3 helper-text">
                Save polished edits, regenerate weaker sections, and keep version history close at hand while you work.
              </p>
            </div>
            <div className="card-muted flex flex-wrap gap-3 p-3">
              <button className="button-secondary" onClick={copyCurrent}>Copy</button>
              <button className="button-secondary" onClick={() => void persistDocuments(content)} disabled={saving || regenerating || exporting !== null}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="button-secondary" onClick={() => void regenerateActiveSection()} disabled={saving || regenerating || exporting !== null}>
                {regenerating ? "Regenerating..." : "Regenerate"}
              </button>
              <button className="button-secondary" onClick={() => void exportFile("docx")} disabled={saving || regenerating || exporting !== null}>
                {exporting === "docx" ? "Exporting..." : "DOCX"}
              </button>
              <button className="button-secondary" onClick={() => void exportFile("pdf")} disabled={saving || regenerating || exporting !== null}>
                {exporting === "pdf" ? "Exporting..." : "PDF"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={tab.key === activeTab ? "button-primary" : "button-secondary"}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {status ? <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</p> : null}
        {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <div className="card-muted p-4 sm:p-5">
          <label className="label">{activeLabel}</label>
          <textarea
            className="min-h-[34rem] w-full rounded-[24px] border border-border bg-white p-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            value={content[activeTab]}
            onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })}
          />
        </div>
      </section>

      <aside className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">Version history</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">{activeLabel}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Every generation, save, and restore creates a snapshot for this section.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {activeHistory.map((version, index) => {
            const isCurrent = index === 0 && version.content === content[activeTab];

            return (
              <div key={version.id} className="card-muted p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {sourceLabels[version.source]}
                      {isCurrent ? " · Current" : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted">{new Date(version.createdAt).toLocaleString()}</p>
                  </div>
                  {!isCurrent ? (
                    <button className="button-secondary px-4 py-2 text-sm" onClick={() => void restoreVersion(version.id)} disabled={saving || regenerating || exporting !== null}>
                      Restore
                    </button>
                  ) : null}
                </div>
                <p className="mt-3 max-h-40 overflow-hidden whitespace-pre-wrap text-sm leading-6 text-muted">{version.content}</p>
              </div>
            );
          })}
          {!activeHistory.length ? <p className="text-sm text-muted">No versions yet.</p> : null}
        </div>
      </aside>
    </div>
  );
}
