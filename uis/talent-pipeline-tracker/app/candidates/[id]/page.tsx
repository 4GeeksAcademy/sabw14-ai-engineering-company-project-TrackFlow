import Link from "next/link";
import { Suspense } from "react";

import { CandidateDetail } from "@/components/CandidateDetail";
import { LoadingState } from "@/components/Feedback";

// El id solo se conoce en tiempo de petición: el componente que usa useParams va dentro de <Suspense>.
export default function CandidatePage() {
  return (
    <div className="grid gap-4">
      <Link href="/" className="text-sm font-semibold text-blue-800 hover:underline">← Volver al listado</Link>
      <Suspense fallback={<LoadingState label="Cargando candidatura…" />}>
        <CandidateDetail />
      </Suspense>
    </div>
  );
}
