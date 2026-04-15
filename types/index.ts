export type FitScoreBand = "low" | "medium" | "high";

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

export type GeneratedDocuments = {
  analysis_summary_et: string;
  cv_et: string;
  motivation_letter_et: string;
  statement_short_et: string;
  statement_long_et: string;
};

export type Project = {
  id: string;
  userId: string;
  title: string;
  cvText: string;
  jobAdText: string;
  analysis?: AnalysisResult;
  documents?: GeneratedDocuments;
  createdAt: string;
  updatedAt: string;
};
