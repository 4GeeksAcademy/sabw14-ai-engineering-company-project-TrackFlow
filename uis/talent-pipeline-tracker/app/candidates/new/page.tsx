"use client";

import Link from "next/link";

import { CandidateForm } from "@/components/CandidateForm";
import { createCandidate } from "@/lib/api";
import { PROCESS } from "@/lib/labels";

export default function NewCandidatePage() {
  return (
    <div className="grid gap-4">
      <Link href="/" className="text-sm font-semibold text-blue-800 hover:underline">← Volver al listado</Link>
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Nueva candidatura</h1>
        <p className="text-slate-600">Candidatos que llegan por otras vías · {PROCESS.position}, {PROCESS.location}</p>
      </div>
      <CandidateForm mode="create" onSubmit={createCandidate} cancelHref="/" />
    </div>
  );
}
