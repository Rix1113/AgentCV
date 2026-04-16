import { makeId } from "@/lib/utils";
import type {
  DocumentSectionKey,
  DocumentVersion,
  DocumentVersionSource,
  GeneratedDocuments,
  StoredDocuments,
} from "@/types";
import { DOCUMENT_SECTION_KEYS } from "@/types";

export const DOCUMENT_SECTION_LABELS: Record<DocumentSectionKey, string> = {
  analysis_summary_et: "Analüüs",
  cv_et: "CV",
  motivation_letter_et: "Motivatsioonikiri",
  statement_short_et: "Lühike enesetutvustus",
  statement_long_et: "Pikk enesetutvustus",
};

export function createEmptyStoredDocuments(): StoredDocuments {
  return DOCUMENT_SECTION_KEYS.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {} as StoredDocuments);
}

export function hasGeneratedDocuments(documents?: StoredDocuments): documents is StoredDocuments {
  if (!documents) {
    return false;
  }

  return DOCUMENT_SECTION_KEYS.some((key) => documents[key].trim().length > 0);
}

export function toGeneratedDocuments(documents: StoredDocuments | GeneratedDocuments): GeneratedDocuments {
  return DOCUMENT_SECTION_KEYS.reduce((acc, key) => {
    acc[key] = documents[key];
    return acc;
  }, {} as GeneratedDocuments);
}

export function normalizeStoredDocuments(
  documents: StoredDocuments | GeneratedDocuments,
  createdAt = new Date().toISOString()
): StoredDocuments {
  const current = toGeneratedDocuments(documents);
  const history = "_history" in documents ? documents._history ?? {} : {};

  const normalizedHistory = DOCUMENT_SECTION_KEYS.reduce((acc, key) => {
    const entries = history[key];

    if (entries?.length) {
      acc[key] = entries;
      return acc;
    }

    acc[key] = [createDocumentVersion(current[key], "initial_generation", createdAt)];
    return acc;
  }, {} as Partial<Record<DocumentSectionKey, DocumentVersion[]>>);

  return {
    ...current,
    _history: normalizedHistory,
  };
}

export function updateDocumentSection(
  documents: StoredDocuments | GeneratedDocuments,
  section: DocumentSectionKey,
  content: string,
  source: DocumentVersionSource,
  createdAt = new Date().toISOString()
): StoredDocuments {
  const normalized = normalizeStoredDocuments(documents, createdAt);
  const sectionHistory = normalized._history?.[section] ?? [];
  const previous = sectionHistory.at(-1);

  if (previous?.content === content) {
    return {
      ...normalized,
      [section]: content,
    };
  }

  return {
    ...normalized,
    [section]: content,
    _history: {
      ...normalized._history,
      [section]: [...sectionHistory, createDocumentVersion(content, source, createdAt)],
    },
  };
}

function createDocumentVersion(
  content: string,
  source: DocumentVersionSource,
  createdAt: string
): DocumentVersion {
  return {
    id: makeId("ver"),
    content,
    createdAt,
    source,
  };
}
