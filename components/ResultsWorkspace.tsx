"use client";

import { useMemo, useState } from "react";
import type { Project, GeneratedDocuments } from "@/types";

const tabs: Array<{ key: keyof GeneratedDocuments; label: string }> = [
  { key: "analysis_summary_et", label: "Analüüs" },
  { key: "cv_et", label: "CV" },
  { key: "motivation_letter_et", label: "Motivatsioonikiri" },
  { key: "statement_short_et", label: "Lühike enesetutvustus" },
  { key: "statement_long_et", label: "Pikk enesetutvustus" },
];

export function ResultsWorkspace({ project }: { project: Project }) {
  const [activeTab, setActiveTab] = useState<keyof GeneratedDocuments>("analysis_summary_et");
  const [content, setContent] = useState(project.documents!);
  const activeLabel = useMemo(() => tabs.find((tab) => tab.key === activeTab)?.label ?? "Document", [activeTab]);

  async function copyCurrent() {
    await navigator.clipboard.writeText(content[activeTab]);
  }

  async function saveChanges() {
    await fetch(`/api/projects`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, documents: content }),
    });
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

  return (
    <div className="grid gap-6">
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
          <button className="button-secondary" onClick={saveChanges}>Save</button>
          <button className="button-secondary" onClick={() => exportFile("docx")}>Download DOCX</button>
          <button className="button-secondary" onClick={() => exportFile("pdf")}>Download PDF</button>
        </div>

        <label className="mb-2 block text-sm font-semibold">{activeLabel}</label>
        <textarea
          className="min-h-[34rem] w-full rounded-2xl border border-border bg-black/20 p-4 text-sm outline-none"
          value={content[activeTab]}
          onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })}
        />
      </section>
    </div>
  );
}
