"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { StageBadge, StatusBadge } from "@/components/Badges";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { listCandidates } from "@/lib/api";
import { isStage, isStatus } from "@/lib/labels";
import type { CandidateFilters } from "@/types/candidate";

export function readFilters(params: URLSearchParams | { get(name: string): string | null }): CandidateFilters {
  const status = params.get("status");
  const stage = params.get("stage");
  return {
    status: isStatus(status) ? status : null,
    stage: isStage(stage) ? stage : null,
    search: params.get("search") ?? "",
  };
}

/** Listado de candidaturas (GET /records) filtrado por los query params de la URL. Las notas no se muestran aquí. */
export function CandidateList() {
  const searchParams = useSearchParams();
  const filters = readFilters(searchParams);
  const { status, data, error, reload } = useAsync(
    () => listCandidates(filters),
    `${filters.status ?? ""}|${filters.stage ?? ""}|${filters.search}`,
  );

  if (status === "error" && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState label="Cargando candidaturas…" />;

  return (
    <section aria-labelledby="titulo-listado" aria-busy={status === "loading"} className="grid gap-3">
      <div className="flex items-center justify-between">
        <h2 id="titulo-listado" className="text-lg font-bold text-slate-900">
          {data.total} {data.total === 1 ? "candidatura" : "candidaturas"}
        </h2>
        {status === "loading" && <span className="text-sm text-slate-500">Actualizando…</span>}
      </div>
      {status === "error" && <ErrorState message={error} onRetry={reload} />}

      {data.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
          No hay candidaturas con estos filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-3">Nombre</th>
                <th scope="col" className="px-4 py-3">Puesto</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3">Etapa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.data.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/candidates/${candidate.id}`} className="font-semibold text-blue-800 hover:underline">
                      {candidate.full_name}
                    </Link>
                    <p className="text-xs text-slate-500">{candidate.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{candidate.position}</td>
                  <td className="px-4 py-3"><StatusBadge status={candidate.status} /></td>
                  <td className="px-4 py-3"><StageBadge stage={candidate.stage} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
