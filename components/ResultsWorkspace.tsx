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
    const res = await fetch(`/api/export/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documents: content }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `estonian-job-agent.${kind}`;
    link.click();
    URL.revokeObjectURL(url);
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="card p-6">
        <div className="mb-4 flex flex-wrap gap-2">
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

        <div className="mb-4 flex flex-wrap gap-3">
          <button className="button-secondary" onClick={copyCurrent}>Copy</button>
          <button className="button-secondary" onClick={() => void persistDocuments(content)} disabled={saving || regenerating}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="button-secondary" onClick={() => void regenerateActiveSection()} disabled={saving || regenerating}>
            {regenerating ? "Regenerating..." : "Regenerate section"}
          </button>
          <button className="button-secondary" onClick={() => exportFile("docx")}>Download DOCX</button>
          <button className="button-secondary" onClick={() => exportFile("pdf")}>Download PDF</button>
        </div>
        {status ? <p className="mb-3 text-sm text-emerald-300">{status}</p> : null}
        {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}

        <label className="mb-2 block text-sm font-semibold">{activeLabel}</label>
        <textarea
          className="min-h-[34rem] w-full rounded-2xl border border-border bg-black/20 p-4 text-sm outline-none"
          value={content[activeTab]}
          onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })}
        />
      </section>

      <aside className="card p-6">
        <h2 className="text-lg font-semibold">Version history</h2>
        <p className="mt-1 text-sm text-slate-300">Every generation, save, and restore creates a section snapshot.</p>

        <div className="mt-5 grid gap-3">
          {activeHistory.map((version, index) => {
            const isCurrent = index === 0 && version.content === content[activeTab];

            return (
              <div key={version.id} className="rounded-2xl border border-border bg-black/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {sourceLabels[version.source]}
                      {isCurrent ? " · Current" : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(version.createdAt).toLocaleString()}</p>
                  </div>
                  {!isCurrent ? (
                    <button className="button-secondary text-sm" onClick={() => void restoreVersion(version.id)} disabled={saving || regenerating}>
                      Restore
                    </button>
                  ) : null}
                </div>
                <p className="mt-3 max-h-40 overflow-hidden whitespace-pre-wrap text-sm text-slate-200">{version.content}</p>
              </div>
            );
          })}
          {!activeHistory.length ? <p className="text-sm text-slate-300">No versions yet.</p> : null}
        </div>
      </aside>
    </div>
  );
}
