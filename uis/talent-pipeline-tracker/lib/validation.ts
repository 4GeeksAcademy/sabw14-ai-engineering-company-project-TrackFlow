// Validación del formulario de candidatura antes de enviarlo (campos requeridos por la API: RecordCreate).
import type { Candidate, CandidateInput } from "@/types/candidate";

export interface CandidateFormValues {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string;
  cv_url: string;
  experience_years: string;
}

export type CandidateFormErrors = Partial<Record<keyof CandidateFormValues, string>>;

export const EMPTY_FORM: CandidateFormValues = {
  full_name: "",
  email: "",
  phone: "",
  position: "Asistente de Dirección",
  linkedin_url: "",
  cv_url: "",
  experience_years: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateCandidateForm(values: CandidateFormValues): CandidateFormErrors {
  const errors: CandidateFormErrors = {};
  const fullName = values.full_name.trim();
  if (fullName.split(/\s+/).filter(Boolean).length < 2) errors.full_name = "Escribe nombre y apellido.";
  if (!EMAIL_RE.test(values.email.trim())) errors.email = "Escribe un email válido (ej.: nombre@empresa.com).";
  if (!PHONE_RE.test(values.phone.trim())) errors.phone = "Escribe un teléfono válido (ej.: +34 976 123 456).";
  if (!values.position.trim()) errors.position = "Indica el puesto al que aplica.";
  const years = Number(values.experience_years);
  if (values.experience_years.trim() === "" || !Number.isFinite(years) || years < 0 || years > 60) {
    errors.experience_years = "Indica los años de experiencia (0 a 60).";
  }
  if (values.linkedin_url.trim() && !isHttpUrl(values.linkedin_url.trim())) {
    errors.linkedin_url = "El enlace de LinkedIn debe empezar por http:// o https://.";
  }
  if (values.cv_url.trim() && !isHttpUrl(values.cv_url.trim())) {
    errors.cv_url = "El enlace al CV debe empezar por http:// o https://.";
  }
  return errors;
}

export function toCandidateInput(values: CandidateFormValues): CandidateInput {
  return {
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    position: values.position.trim(),
    linkedin_url: values.linkedin_url.trim() || null,
    cv_url: values.cv_url.trim() || null,
    experience_years: Number(values.experience_years),
  };
}

export function toFormValues(candidate: Candidate): CandidateFormValues {
  return {
    full_name: candidate.full_name,
    email: candidate.email,
    phone: candidate.phone,
    position: candidate.position,
    linkedin_url: candidate.linkedin_url ?? "",
    cv_url: candidate.cv_url ?? "",
    experience_years: String(candidate.experience_years),
  };
}
