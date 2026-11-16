"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncState<T> =
  | { status: "loading"; data: T | null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: T | null; error: string };

interface Stored<T> {
  key: string | null;
  status: "loading" | "success" | "error";
  data: T | null;
  error: string | null;
}

/**
 * Ejecuta una carga asíncrona y expone sus tres estados (cargando, éxito, error).
 * - Se relanza cuando cambia `key` (filtros, id…). Mientras tanto conserva los datos anteriores.
 * - "loading" se deriva de que la clave cambió: el efecto solo hace setState cuando la promesa resuelve.
 * - Ignora respuestas de cargas obsoletas.
 * - `setData` actualiza la UI tras un PATCH/PUT/POST sin volver a pedir los datos.
 */
export function useAsync<T>(load: () => Promise<T>, key: string): AsyncState<T> & {
  reload: () => void;
  setData: (update: (current: T) => T) => void;
} {
  const [stored, setStored] = useState<Stored<T>>({ key: null, status: "loading", data: null, error: null });
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let cancelled = false;
    loadRef.current().then(
      (data) => {
        if (!cancelled) setStored({ key, status: "success", data, error: null });
      },
      (error: unknown) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Error inesperado.";
          setStored((prev) => ({ key, status: "error", data: prev.data, error: message }));
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  const reload = useCallback(() => {
    setStored((prev) => ({ ...prev, status: "loading", error: null }));
    setAttempt((n) => n + 1);
  }, []);

  const setData = useCallback((update: (current: T) => T) => {
    setStored((prev) => (prev.data === null ? prev : { ...prev, status: "success", data: update(prev.data), error: null }));
  }, []);

  const helpers = { reload, setData };
  if (stored.key !== key || stored.status === "loading") {
    return { status: "loading", data: stored.data, error: null, ...helpers };
  }
  if (stored.status === "error") {
    return { status: "error", data: stored.data, error: stored.error ?? "Error inesperado.", ...helpers };
  }
  return { status: "success", data: stored.data as T, error: null, ...helpers };
}
