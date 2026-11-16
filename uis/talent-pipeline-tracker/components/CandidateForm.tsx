"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { NoticeBanner, type Notice } from "@/components/Feedback";
import {
  EMPTY_FORM,
  toCandidateInput,
  validateCandidateForm,
  type CandidateFormErrors,
  type CandidateFormValues,
} from "@/lib/validation";
import type { Candidate, CandidateInput } from "@/types/candidate";

type FieldDef = {
  name: keyof CandidateFormValues;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  inputMode?: "numeric" | "email" | "tel" | "url";
};

const FIELDS: FieldDef[] = [
  { name: "full_name", label: "Nombre completo", type: "text", required: true, placeholder: "Laura Martín" },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "laura@empresa.com", inputMode: "email" },
  { name: "phone", label: "Teléfono", type: "tel", required: true, placeholder: "+34 976 123 456", inputMode: "tel" },
  { name: "position", label: "Puesto", type: "text", required: true },
  { name: "experience_years", label: "Años de experiencia", type: "number", required: true, inputMode: "numeric" },
  { name: "linkedin_url", label: "LinkedIn", type: "url", required: false, placeholder: "https://linkedin.com/in/…", inputMode: "url" },
  { name: "cv_url", label: "Enlace al CV", type: "url", required: false, placeholder: "https://…", inputMode: "url" },
];

interface CandidateFormProps {
  mode: "create" | "edit";
  initialValues?: CandidateFormValues;
  onSubmit: (input: CandidateInput) => Promise<Candidate>;
  cancelHref: string;
}

/** Formulario de alta (POST) y edición (PUT): valida los campos requeridos antes de enviar y muestra el resultado. */
export function CandidateForm({ mode, initialValues = EMPTY_FORM, onSubmit, cancelHref }: CandidateFormProps) {
  const [values, setValues] = useState<CandidateFormValues>(initialValues);
  const [errors, setErrors] = useState<CandidateFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [saved, setSaved] = useState<Candidate | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateCandidateForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setNotice({ kind: "error", message: "Revisa los campos marcados antes de guardar." });
      return;
    }
    setSubmitting(true);
    setNotice(null);
    try {
      const candidate = await onSubmit(toCandidateInput(values));
      setSaved(candidate);
      setNotice({
        kind: "success",
        message: mode === "create" ? `Candidatura de ${candidate.full_name} registrada.` : "Cambios guardados.",
      });
      if (mode === "create") setValues(EMPTY_FORM);
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "No se pudo guardar." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const error = errors[field.name];
          return (
            <div key={field.name} className={field.name === "full_name" ? "sm:col-span-2" : undefined}>
              <label htmlFor={field.name} className="block text-sm font-medium text-slate-700">
                {field.label} {field.required ? <span className="text-red-700" aria-hidden="true">*</span> : <span className="font-normal text-slate-500">(opcional)</span>}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                inputMode={field.inputMode}
                required={field.required}
                min={field.type === "number" ? 0 : undefined}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 aria-invalid:border-red-600"
              />
              {error && <p id={`${field.name}-error`} className="mt-1 text-sm text-red-700">{error}</p>}
            </div>
          );
        })}
      </div>

      <NoticeBanner notice={notice} />
      {saved && (
        <Link href={`/candidates/${saved.id}`} className="text-sm font-semibold text-blue-800 hover:underline">
          Ver la candidatura de {saved.full_name} →
        </Link>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={submitting} className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
          {submitting ? "Guardando…" : mode === "create" ? "Registrar candidatura" : "Guardar cambios"}
        </button>
        <Link href={cancelHref} className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100">
          {saved ? "Volver" : "Cancelar"}
        </Link>
      </div>
    </form>
  );
}
