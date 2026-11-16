import { Suspense } from "react";

import { CandidateFilters } from "@/components/CandidateFilters";
import { CandidateList } from "@/components/CandidateList";
import { LoadingState } from "@/components/Feedback";
import { PROCESS } from "@/lib/labels";

// Los componentes que leen la URL (useSearchParams) van dentro de <Suspense> (requisito de cacheComponents).
export default function CandidatesPage() {
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Candidaturas</h1>
        <p className="text-slate-600">
          {PROCESS.position} · {PROCESS.location}
        </p>
      </div>
      <Suspense fallback={<LoadingState label="Cargando filtros…" />}>
        <CandidateFilters />
      </Suspense>
      <Suspense fallback={<LoadingState label="Cargando candidaturas…" />}>
        <CandidateList />
      </Suspense>
    </div>
  );
}
