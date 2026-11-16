import { vi } from "vitest";

import type { Candidate, CandidateNote } from "@/types/candidate";

export function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: "c-1",
    full_name: "Laura Martín",
    email: "laura.martin@example.com",
    phone: "+34 976 123 456",
    position: "Asistente de Dirección",
    linkedin_url: "https://linkedin.com/in/laura-martin",
    cv_url: null,
    status: "in_progress",
    stage: "personal_interview",
    experience_years: 6,
    notes_count: 1,
    applied_at: "2026-03-12T20:04:32.113Z",
    updated_at: "2026-03-12T20:04:32.113Z",
    ...overrides,
  };
}

export function note(overrides: Partial<CandidateNote> = {}): CandidateNote {
  return { id: "n-1", record_id: "c-1", content: "Buena entrevista telefónica.", created_at: "2026-03-24T20:04:32.113Z", ...overrides };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type Route = { method: string; path: RegExp; respond: (init: RequestInit | undefined, url: string) => Response };

/** Simula la API: cada llamada se resuelve con la primera ruta que coincida (método + path). */
export function mockApi(routes: Route[]) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method ?? "GET").toUpperCase();
    const route = routes.find((r) => r.method === method && r.path.test(new URL(url).pathname));
    if (!route) throw new Error(`Llamada no simulada: ${method} ${url}`);
    return route.respond(init, url);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
