"use client";

import { useParams } from "next/navigation";

import { CandidateForm } from "@/components/CandidateForm";
import { ErrorState, LoadingState } from "@/components/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { getCandidate, replaceCandidate } from "@/lib/api";
import { toFormValues } from "@/lib/validation";

/** Edición de los datos de una candidatura (PUT /records/:id). */
export function EditCandidate() {
  const { id } = useParams<{ id: string }>();
  const { status, data, error, reload } = useAsync(() => getCandidate(id), id);

  if (status === "error" && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState label="Cargando candidatura…" />;

  return (
    <CandidateForm
      key={data.id}
      mode="edit"
      initialValues={toFormValues(data)}
      onSubmit={(input) => replaceCandidate(data.id, input)}
      cancelHref={`/candidates/${data.id}`}
    />
  );
}
