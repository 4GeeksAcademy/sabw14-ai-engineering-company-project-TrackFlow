import Link from "next/link";
import { Suspense } from "react";

import { EditCandidate } from "@/components/EditCandidate";
import { LoadingState } from "@/components/Feedback";

export default function EditCandidatePage() {
  return (
    <div className="grid gap-4">
      <Link href="/" className="text-sm font-semibold text-blue-800 hover:underline">← Volver al listado</Link>
      <h1 className="text-2xl font-extrabold text-slate-900">Editar candidatura</h1>
      <Suspense fallback={<LoadingState label="Cargando candidatura…" />}>
        <EditCandidate />
      </Suspense>
    </div>
  );
}
