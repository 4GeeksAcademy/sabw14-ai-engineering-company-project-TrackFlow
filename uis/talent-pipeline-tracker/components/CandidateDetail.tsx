"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { StageBadge, StatusBadge } from "@/components/Badges";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { NotesPanel } from "@/components/NotesPanel";
import { PipelineControls } from "@/components/PipelineControls";
import { useAsync } from "@/hooks/useAsync";
import { getCandidate } from "@/lib/api";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

/** Detalle de candidatura (GET /records/:id) con controles de estado/etapa y notas. */
export function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const { status, data: candidate, error, reload, setData } = useAsync(() => getCandidate(id), id);

  if (status === "error" && !candidate) return <ErrorState message={error} onRetry={reload} />;
  if (!candidate) return <LoadingState label="Cargando candidatura…" />;

  const fields: [string, React.ReactNode][] = [
    ["Email", <a key="e" href={`mailto:${candidate.email}`} className="text-blue-800 hover:underline">{candidate.email}</a>],
    ["Teléfono", candidate.phone],
    ["Puesto", candidate.position],
    ["LinkedIn", candidate.linkedin_url
      ? <a key="l" href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline">Ver perfil</a>
      : "No indicado"],
    ["CV", candidate.cv_url
      ? <a key="c" href={candidate.cv_url} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline">Abrir CV</a>
      : "No indicado"],
    ["Años de experiencia", candidate.experience_years],
    ["Estado", <StatusBadge key="s" status={candidate.status} />],
    ["Etapa", <StageBadge key="t" stage={candidate.stage} />],
    ["Fecha de aplicación", formatDate(candidate.applied_at)],
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{candidate.full_name}</h1>
          <p className="text-slate-600">{candidate.position}</p>
        </div>
        <Link href={`/candidates/${candidate.id}/edit`} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          Editar datos
        </Link>
      </div>
      {status === "error" && <ErrorState message={error} onRetry={reload} />}

      <section aria-labelledby="titulo-datos" className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 id="titulo-datos" className="sr-only">Datos de la candidatura</h2>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="mt-0.5 text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <PipelineControls candidate={candidate} onUpdated={(updated) => setData(() => updated)} />
      <NotesPanel candidateId={candidate.id} />
    </div>
  );
}
