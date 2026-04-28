"use client";

import { useMemo, useState } from "react";
import { Copy, Download, History, RefreshCw, Save, Sparkles } from "lucide-react";
import { DOCUMENT_SECTION_KEYS, type DocumentSectionKey, type DocumentVersionSource, type Project } from "@/types";
import { DOCUMENT_SECTION_LABELS, normalizeStoredDocuments } from "@/lib/documents";
import { formatIsoDateTimeUtc } from "@/lib/utils";

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

function WorkspaceActionButton({
  children,
  icon,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button className="button-secondary gap-2 text-sm" onClick={onClick} disabled={disabled}>
      {icon}
      {children}
    </button>
  );
}

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
  const currentLength = content[activeTab].trim().length;
  const projectUpdated = formatIsoDateTimeUtc(project.updatedAt);

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
      const query = new URLSearchParams({
        projectId: project.id,
        section: activeTab,
        format: kind,
      });
      const res = await fetch(`/api/projects?${query.toString()}`);
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
      link.style.display = "none";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(`${activeLabel} downloaded as ${kind.toUpperCase()}.`);
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
    <div className="grid gap-6">
      <section className="hero-panel overflow-hidden p-6 sm:p-8">
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <div className="max-w-3xl">
            <p className="eyebrow">Review workspace</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[0.98] text-ink sm:text-5xl">Refine each section until the application feels ready to send.</h1>
            <p className="mt-4 helper-text">
              Save polished edits, regenerate weaker sections, and keep version history close at hand while you work.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-accent/15 bg-white/85 px-4 py-2 text-sm font-semibold text-ink">{project.title}</span>
              <span className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm text-muted">Updated {projectUpdated}</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="metric-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Active section</p>
              <p className="mt-3 text-2xl font-semibold text-ink">{activeLabel}</p>
            </div>
            <div className="metric-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Characters</p>
              <p className="mt-3 text-2xl font-semibold text-ink">{currentLength.toLocaleString()}</p>
            </div>
            <div className="metric-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Versions</p>
              <p className="mt-3 text-2xl font-semibold text-ink">{activeHistory.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="card p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">Editor</p>
                <h2 className="mt-3 text-3xl font-semibold text-ink">Focused editing with export-ready output.</h2>
                <p className="mt-3 helper-text">
                Save polished edits, regenerate weaker sections, and keep version history close at hand while you work.
                </p>
              </div>
              <div className="card-muted flex flex-wrap gap-3 p-3">
                <WorkspaceActionButton icon={<Copy className="h-4 w-4" />} onClick={() => void copyCurrent()}>
                  Copy
                </WorkspaceActionButton>
                <WorkspaceActionButton
                  icon={<Save className="h-4 w-4" />}
                  onClick={() => void persistDocuments(content)}
                  disabled={saving || regenerating || exporting !== null}
                >
                  {saving ? "Saving..." : "Save"}
                </WorkspaceActionButton>
                <WorkspaceActionButton
                  icon={<Sparkles className="h-4 w-4" />}
                  onClick={() => void regenerateActiveSection()}
                  disabled={saving || regenerating || exporting !== null}
                >
                  {regenerating ? "Regenerating..." : "Regenerate"}
                </WorkspaceActionButton>
                <WorkspaceActionButton
                  icon={<Download className="h-4 w-4" />}
                  onClick={() => void exportFile("docx")}
                  disabled={saving || regenerating || exporting !== null || content[activeTab].trim().length === 0}
                >
                  {exporting === "docx" ? "Downloading..." : "DOCX"}
                </WorkspaceActionButton>
                <WorkspaceActionButton
                  icon={<Download className="h-4 w-4" />}
                  onClick={() => void exportFile("pdf")}
                  disabled={saving || regenerating || exporting !== null || content[activeTab].trim().length === 0}
                >
                  {exporting === "pdf" ? "Downloading..." : "PDF"}
                </WorkspaceActionButton>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-[22px] border px-4 py-4 text-left transition ${
                    tab.key === activeTab
                      ? "border-accent/20 bg-accentSoft text-accent shadow-soft"
                      : "border-border/80 bg-white/70 text-muted hover:border-accent/20 hover:bg-white hover:text-ink"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">Section</p>
                  <p className="mt-2 text-base font-semibold">{tab.label}</p>
                </button>
              ))}
            </div>
          </div>

          {status ? <p className="status-panel mb-4 border-emerald-200 bg-emerald-50/95 text-emerald-700">{status}</p> : null}
          {error ? <p className="status-panel mb-4 border-rose-200 bg-rose-50/95 text-rose-700">{error}</p> : null}

          <div className="card-muted p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <label className="label mb-0">{activeLabel}</label>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {currentLength.toLocaleString()} chars
              </span>
            </div>
            <textarea
              className="editor-textarea"
              value={content[activeTab]}
              onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })}
            />
          </div>
        </section>

        <aside className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                <History className="h-4 w-4" />
                <span>Version history</span>
              </div>
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
                      <p className="mt-1 text-xs text-muted">{formatIsoDateTimeUtc(version.createdAt)}</p>
                    </div>
                    {!isCurrent ? (
                      <button className="button-secondary gap-2 px-4 py-2 text-sm" onClick={() => void restoreVersion(version.id)} disabled={saving || regenerating || exporting !== null}>
                        <RefreshCw className="h-4 w-4" />
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
    </div>
  );
}
