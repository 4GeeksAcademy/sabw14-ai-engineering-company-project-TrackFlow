"use client";

import { useState } from "react";

import { NoticeBanner, type Notice } from "@/components/Feedback";
import { patchCandidate } from "@/lib/api";
import { STAGE_LABELS, STAGES, STATUS_LABELS, STATUSES, isStage, isStatus } from "@/lib/labels";
import type { Candidate, CandidatePatch } from "@/types/candidate";

/** Cambia estado o etapa con una sola interacción (PATCH /records/:id). */
export function PipelineControls({ candidate, onUpdated }: { candidate: Candidate; onUpdated: (c: Candidate) => void }) {
  const [saving, setSaving] = useState<keyof CandidatePatch | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  async function save(patch: CandidatePatch, field: keyof CandidatePatch, label: string) {
    setSaving(field);
    setNotice(null);
    try {
      const updated = await patchCandidate(candidate.id, patch);
      onUpdated(updated);
      setNotice({ kind: "success", message: `${field === "status" ? "Estado actualizado" : "Etapa actualizada"} a «${label}».` });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "No se pudo actualizar." });
    } finally {
      setSaving(null);
    }
  }

  return (
    <section aria-labelledby="titulo-pipeline" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 id="titulo-pipeline" className="font-bold text-slate-900">Estado del proceso</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Estado
          <select
            value={candidate.status}
            disabled={saving !== null}
            onChange={(e) => isStatus(e.target.value) && save({ status: e.target.value }, "status", STATUS_LABELS[e.target.value])}
            className="rounded-md border border-slate-300 px-3 py-2 font-normal disabled:opacity-60"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Etapa
          <select
            value={candidate.stage}
            disabled={saving !== null}
            onChange={(e) => isStage(e.target.value) && save({ stage: e.target.value }, "stage", STAGE_LABELS[e.target.value])}
            className="rounded-md border border-slate-300 px-3 py-2 font-normal disabled:opacity-60"
          >
            {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
        </label>
      </div>
      {saving && <p role="status" className="text-sm text-slate-600">Guardando…</p>}
      <NoticeBanner notice={notice} />
    </section>
  );
}
