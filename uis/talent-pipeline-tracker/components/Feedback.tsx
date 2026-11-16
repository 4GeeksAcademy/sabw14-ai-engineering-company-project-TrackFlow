// Estados visibles de las operaciones asíncronas: cargando, error (con reintento) y avisos de éxito/error.

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-slate-600">
      <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
      <p className="font-semibold">No se pudo completar la operación</p>
      <p className="mt-1 text-sm">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 rounded-md border border-red-700 px-3 py-1.5 text-sm font-semibold hover:bg-red-100">
          Reintentar
        </button>
      )}
    </div>
  );
}

export type Notice = { kind: "success" | "error"; message: string } | null;

export function NoticeBanner({ notice }: { notice: Notice }) {
  if (!notice) return null;
  const styles =
    notice.kind === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : "border-red-300 bg-red-50 text-red-800";
  return (
    <p role={notice.kind === "error" ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-sm font-medium ${styles}`}>
      {notice.message}
    </p>
  );
}
