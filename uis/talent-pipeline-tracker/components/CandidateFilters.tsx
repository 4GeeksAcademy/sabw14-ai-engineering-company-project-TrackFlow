"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { STAGE_LABELS, STAGES, STATUS_LABELS, STATUSES } from "@/lib/labels";

export const SEARCH_DEBOUNCE_MS = 300;

/** Filtros por estado y etapa y búsqueda por nombre/email: viven en la URL (?status=&stage=&search=), sin recargar. */
export function CandidateFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(urlSearch);

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  // La búsqueda se aplica cuando el usuario deja de escribir (sin recargar la página).
  useEffect(() => {
    if (search.trim() === urlSearch) return;
    const timer = setTimeout(() => updateParam("search", search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters = searchParams.has("status") || searchParams.has("stage") || searchParams.has("search");

  return (
    <section aria-label="Filtros" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Buscar por nombre o email
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ej.: Laura o laura@empresa.com"
          className="rounded-md border border-slate-300 px-3 py-2 font-normal focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Estado
        <select
          value={searchParams.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 font-normal focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">Todos</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Etapa
        <select
          value={searchParams.get("stage") ?? ""}
          onChange={(e) => updateParam("stage", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 font-normal focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">Todas</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{STAGE_LABELS[s]}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        disabled={!hasFilters}
        onClick={() => {
          setSearch("");
          router.replace(pathname, { scroll: false });
        }}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Limpiar filtros
      </button>
    </section>
  );
}
