// Etiquetas de BRIEFING.md (TrackFlow · Hito 3): los valores crudos de la API nunca se muestran en la UI.
import type { RecordStage, RecordStatus } from "@/types/candidate";

export const STATUS_LABELS: Record<RecordStatus, string> = {
  received: "Recibida",
  in_progress: "En proceso",
  selected: "Seleccionada",
  discarded: "Descartada",
};

export const STAGE_LABELS: Record<RecordStage, string> = {
  pending: "Pendiente de revisión",
  review: "En revisión",
  personal_interview: "Entrevista personal",
  technical_interview: "Entrevista técnica",
  offer_presented: "Oferta presentada",
};

export const STATUSES = Object.keys(STATUS_LABELS) as RecordStatus[];
export const STAGES = Object.keys(STAGE_LABELS) as RecordStage[];

export function isStatus(value: string | null | undefined): value is RecordStatus {
  return value != null && value in STATUS_LABELS;
}

export function isStage(value: string | null | undefined): value is RecordStage {
  return value != null && value in STAGE_LABELS;
}

/** Etiqueta legible; si la API devolviera un valor desconocido se muestra "Sin definir", nunca el valor crudo. */
export function statusLabel(value: string): string {
  return isStatus(value) ? STATUS_LABELS[value] : "Sin definir";
}

export function stageLabel(value: string): string {
  return isStage(value) ? STAGE_LABELS[value] : "Sin definir";
}

export const PROCESS = {
  position: "Asistente de Dirección",
  company: "TrackFlow",
  location: "Sede Zaragoza",
} as const;
