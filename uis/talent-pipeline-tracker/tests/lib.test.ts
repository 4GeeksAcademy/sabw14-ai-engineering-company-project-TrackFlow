import { describe, expect, it } from "vitest";

import { ApiError, buildListQuery, deleteNote, listCandidates, listNotes, patchCandidate } from "@/lib/api";
import { STAGE_LABELS, STATUS_LABELS, stageLabel, statusLabel } from "@/lib/labels";
import { EMPTY_FORM, toCandidateInput, validateCandidateForm } from "@/lib/validation";
import { candidate, jsonResponse, mockApi } from "./helpers";

describe("etiquetas del briefing", () => {
  it("todos los valores de la API tienen la etiqueta exacta del briefing", () => {
    expect(STATUS_LABELS).toEqual({ received: "Recibida", in_progress: "En proceso", selected: "Seleccionada", discarded: "Descartada" });
    expect(STAGE_LABELS).toEqual({
      pending: "Pendiente de revisión",
      review: "En revisión",
      personal_interview: "Entrevista personal",
      technical_interview: "Entrevista técnica",
      offer_presented: "Oferta presentada",
    });
  });

  it("un valor desconocido nunca se muestra crudo", () => {
    expect(statusLabel("archived")).toBe("Sin definir");
    expect(stageLabel("hr_call")).toBe("Sin definir");
  });
});

describe("cliente de la API", () => {
  it("los filtros viajan como query params", () => {
    expect(buildListQuery({ status: "in_progress", stage: "review", search: "  laura " })).toBe(
      "limit=200&page=1&status=in_progress&stage=review&search=laura",
    );
    expect(buildListQuery({ status: null, stage: null, search: "" })).toBe("limit=200&page=1");
  });

  it("listCandidates hace GET /records con los filtros", async () => {
    const fetchMock = mockApi([{ method: "GET", path: /\/records$/, respond: () => jsonResponse({ total: 1, page: 1, limit: 200, data: [candidate()] }) }]);
    const result = await listCandidates({ status: "selected", stage: null, search: "" });
    expect(result.total).toBe(1);
    expect(String(fetchMock.mock.calls[0]![0])).toContain("/records?limit=200&page=1&status=selected");
  });

  it("PATCH envía solo el campo cambiado", async () => {
    const fetchMock = mockApi([{ method: "PATCH", path: /\/records\/c-1$/, respond: () => jsonResponse(candidate({ status: "selected" })) }]);
    await patchCandidate("c-1", { status: "selected" });
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ method: "PATCH", body: JSON.stringify({ status: "selected" }) });
  });

  it("los errores de validación de la API se convierten en un mensaje legible", async () => {
    mockApi([{ method: "PATCH", path: /records/, respond: () => jsonResponse({ detail: [{ loc: ["body", "stage"], msg: "Input should be 'pending'" }] }, 422) }]);
    await expect(patchCandidate("c-1", { stage: "review" })).rejects.toThrow("stage: Input should be 'pending'");
  });

  it("listNotes desenvuelve { data, meta } (forma real de la API)", async () => {
    mockApi([{ method: "GET", path: /\/notes$/, respond: () => jsonResponse({ data: [{ id: "n-1", record_id: "c-1", content: "Hola", created_at: "2026-11-12T00:00:00Z" }], meta: { total: 1 } }) }]);
    expect((await listNotes("c-1")).map((n) => n.content)).toEqual(["Hola"]);
  });

  it("404 y caída de red dan ApiError con mensaje en español", async () => {
    mockApi([{ method: "DELETE", path: /notes/, respond: () => jsonResponse({}, 404) }]);
    await expect(deleteNote("c-1", "n-x")).rejects.toMatchObject({ status: 404, message: "No se encontró el recurso solicitado." });
    mockApi([{ method: "GET", path: /records/, respond: () => { throw new TypeError("network"); } }]);
    await expect(listCandidates({ status: null, stage: null, search: "" })).rejects.toBeInstanceOf(ApiError);
  });
});

describe("validación del formulario", () => {
  const valid = { ...EMPTY_FORM, full_name: "Laura Martín", email: "laura@example.com", phone: "+34 976 123 456", experience_years: "6" };

  it("exige los campos requeridos por la API antes de enviar", () => {
    const errors = validateCandidateForm({ ...EMPTY_FORM, position: "" });
    expect(Object.keys(errors).sort()).toEqual(["email", "experience_years", "full_name", "phone", "position"]);
  });

  it("valida formato de email, teléfono, años y URLs opcionales", () => {
    expect(validateCandidateForm(valid)).toEqual({});
    expect(validateCandidateForm({ ...valid, email: "laura@" }).email).toBeDefined();
    expect(validateCandidateForm({ ...valid, experience_years: "-1" }).experience_years).toBeDefined();
    expect(validateCandidateForm({ ...valid, linkedin_url: "linkedin.com/in/x" }).linkedin_url).toBeDefined();
    expect(validateCandidateForm({ ...valid, cv_url: "https://cv.example.com/laura.pdf" }).cv_url).toBeUndefined();
  });

  it("toCandidateInput recorta y convierte vacíos en null y los años en número", () => {
    expect(toCandidateInput({ ...valid, full_name: "  Laura Martín ", cv_url: " " })).toMatchObject({
      full_name: "Laura Martín",
      cv_url: null,
      linkedin_url: null,
      experience_years: 6,
    });
  });
});
