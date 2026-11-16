// Tipos de la API del Talent Pipeline (OpenAPI: https://playground.4geeks.com/tracker/api/v1/docs).

export type RecordStatus = "received" | "in_progress" | "selected" | "discarded";

export type RecordStage =
  | "pending"
  | "review"
  | "personal_interview"
  | "technical_interview"
  | "offer_presented";

export interface CandidateNote {
  id: string;
  record_id: string;
  content: string;
  created_at: string;
}

/** RecordOut de la API. */
export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: RecordStatus;
  stage: RecordStage;
  experience_years: number;
  notes_count: number;
  applied_at: string;
  updated_at: string;
}

/** RecordCreate de la API (POST /records y PUT /records/:id). */
export interface CandidateInput {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  experience_years: number;
}

/** RecordPatch de la API (PATCH /records/:id). */
export interface CandidatePatch {
  status?: RecordStatus;
  stage?: RecordStage;
}

/** GET /records/:id/notes devuelve las notas envueltas (no documentado en el OpenAPI; verificado contra la API). */
export interface CandidateNoteList {
  data: CandidateNote[];
  meta: { total: number };
}

export interface CandidateList {
  total: number;
  page: number;
  limit: number;
  data: Candidate[];
}

export interface CandidateFilters {
  status: RecordStatus | null;
  stage: RecordStage | null;
  search: string;
}
