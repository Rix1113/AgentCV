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

export const USAGE_EVENT_TYPES = [
  "page_view",
  "project_created",
  "project_documents_updated",
  "analysis_generated",
  "documents_generated",
  "section_regenerated",
  "exported_pdf",
  "exported_docx",
  "admin_analytics_viewed",
  "admin_user_plan_updated",
] as const;

export type UsageEventType = (typeof USAGE_EVENT_TYPES)[number];

export type UsageEventMetadata = {
  method?: string;
  pathname?: string;
  userEmail?: string | null;
  managedUserId?: string;
  managedUserEmail?: string | null;
  assignedPlan?: Exclude<PlanTier, "admin">;
  section?: DocumentSectionKey;
  exportFormat?: "pdf" | "docx";
  fitScoreBand?: FitScoreBand;
  projectTitle?: string;
  changedSections?: DocumentSectionKey[];
  sources?: Partial<Record<DocumentSectionKey, DocumentVersionSource>>;
};

export type UsageEvent = {
  id: string;
  userId?: string;
  eventType: UsageEventType;
  route?: string;
  projectId?: string;
  metadata?: UsageEventMetadata;
  createdAt: string;
};

export type PlanTier = "free" | "pro" | "admin";

export type PlanUsageSummary = {
  plan: PlanTier;
  resetsAt: string;
  trackingEnabled: boolean;
  generations: {
    used: number | null;
    limit: number | null;
    remaining: number | null;
  };
  exports: {
    used: number | null;
    limit: number | null;
    remaining: number | null;
  };
};

export type UserPlanProfile = {
  userId: string;
  email: string | null;
  plan: Exclude<PlanTier, "admin">;
  createdAt: string;
  updatedAt: string;
};

export type AdminManagedUser = {
  userId: string;
  email: string | null;
  displayEmail: string;
  lastSignInAt: string | null;
  createdAt: string | null;
  isAdmin: boolean;
  effectivePlan: PlanTier;
  editablePlan: Exclude<PlanTier, "admin">;
  profileUpdatedAt: string | null;
};
