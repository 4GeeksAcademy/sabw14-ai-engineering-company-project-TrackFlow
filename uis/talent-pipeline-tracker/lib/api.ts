// Cliente de la API del Talent Pipeline. Todas las llamadas son async/await y lanzan ApiError si fallan.
import type {
  Candidate,
  CandidateFilters,
  CandidateInput,
  CandidateList,
  CandidateNote,
  CandidateNoteList,
  CandidatePatch,
} from "@/types/candidate";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://playground.4geeks.com/tracker/api/v1").replace(/\/+$/, "");

/** Límite de candidaturas por consulta (la campaña tiene ~100). */
export const LIST_LIMIT = 200;

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

interface ValidationDetail {
  loc?: unknown[];
  msg?: string;
}

function describeError(body: unknown, status: number): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return (detail as ValidationDetail[])
        .map((d) => [d.loc?.slice(1).join("."), d.msg].filter(Boolean).join(": "))
        .join(" · ");
    }
  }
  if (status === 404) return "No se encontró el recurso solicitado.";
  return `La API respondió con un error (${status}).`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) },
    });
  } catch {
    throw new ApiError("No se pudo conectar con la API. Revisa tu conexión e inténtalo de nuevo.", 0);
  }
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new ApiError(describeError(body, response.status), response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function buildListQuery(filters: CandidateFilters): string {
  const params = new URLSearchParams({ limit: String(LIST_LIMIT), page: "1" });
  if (filters.status) params.set("status", filters.status);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.search.trim()) params.set("search", filters.search.trim());
  return params.toString();
}

export async function listCandidates(filters: CandidateFilters): Promise<CandidateList> {
  return request<CandidateList>(`/records?${buildListQuery(filters)}`);
}

export async function getCandidate(id: string): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`);
}

export async function createCandidate(input: CandidateInput): Promise<Candidate> {
  return request<Candidate>("/records", { method: "POST", body: JSON.stringify(input) });
}

export async function replaceCandidate(id: string, input: CandidateInput): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function patchCandidate(id: string, patch: CandidatePatch): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export async function listNotes(id: string): Promise<CandidateNote[]> {
  // La API responde { data: [...], meta: { total } }; se acepta también un array por robustez.
  const body = await request<CandidateNoteList | CandidateNote[]>(`/records/${encodeURIComponent(id)}/notes`);
  return Array.isArray(body) ? body : (body?.data ?? []);
}

export async function addNote(id: string, content: string): Promise<CandidateNote> {
  return request<CandidateNote>(`/records/${encodeURIComponent(id)}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function deleteNote(id: string, noteId: string): Promise<void> {
  await request<void>(`/records/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`, { method: "DELETE" });
}
