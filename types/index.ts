export type FitScoreBand = "low" | "medium" | "high";

export const DOCUMENT_SECTION_KEYS = [
  "analysis_summary_et",
  "cv_et",
  "motivation_letter_et",
  "statement_short_et",
  "statement_long_et",
] as const;

export type DocumentSectionKey = (typeof DOCUMENT_SECTION_KEYS)[number];

export type DocumentVersionSource =
  | "initial_generation"
  | "regenerated"
  | "manual_edit"
  | "restored";

export type DocumentVersion = {
  id: string;
  content: string;
  createdAt: string;
  source: DocumentVersionSource;
};

export type AnalysisResult = {
  target_role: string;
  employer_name: string;
  candidate_summary: string;
  matched_skills: string[];
  transferable_skills: string[];
  keyword_targets: string[];
  strengths: string[];
  weak_points: string[];
  missing_information: string[];
  relevant_experience_areas: string[];
  tone_guidance: string;
  fit_score_band: FitScoreBand;
};

export type GeneratedDocuments = Record<DocumentSectionKey, string>;

export type StoredDocuments = GeneratedDocuments & {
  _history?: Partial<Record<DocumentSectionKey, DocumentVersion[]>>;
};

export type Project = {
  id: string;
  userId: string;
  title: string;
  cvText: string;
  jobAdText: string;
  analysis?: AnalysisResult;
  documents?: StoredDocuments;
  createdAt: string;
  updatedAt: string;
};
