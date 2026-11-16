"use client";

import { useState, type FormEvent } from "react";

import { ErrorState, LoadingState, NoticeBanner, type Notice } from "@/components/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { addNote, deleteNote, listNotes } from "@/lib/api";

const MAX_NOTE = 1000;

/** Notas internas de una candidatura (solo en el detalle): listar, añadir y eliminar. */
export function NotesPanel({ candidateId }: { candidateId: string }) {
  const notes = useAsync(() => listNotes(candidateId), candidateId);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = content.trim();
    if (!text) {
      setNotice({ kind: "error", message: "La nota no puede estar vacía." });
      return;
    }
    setBusy("add");
    setNotice(null);
    try {
      const note = await addNote(candidateId, text);
      notes.setData((current) => [note, ...current]);
      setContent("");
      setNotice({ kind: "success", message: "Nota añadida." });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "No se pudo añadir la nota." });
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(noteId: string) {
    setBusy(noteId);
    setNotice(null);
    try {
      await deleteNote(candidateId, noteId);
      notes.setData((current) => current.filter((n) => n.id !== noteId));
      setNotice({ kind: "success", message: "Nota eliminada." });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "No se pudo eliminar la nota." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section aria-labelledby="titulo-notas" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 id="titulo-notas" className="font-bold text-slate-900">Notas internas</h2>

      <form onSubmit={handleAdd} className="grid gap-2">
        <label htmlFor="nueva-nota" className="text-sm font-medium text-slate-700">Nueva nota (tras una llamada o entrevista)</label>
        <textarea
          id="nueva-nota"
          rows={3}
          maxLength={MAX_NOTE}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button type="submit" disabled={busy !== null} className="justify-self-start rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
          {busy === "add" ? "Añadiendo…" : "Añadir nota"}
        </button>
      </form>
      <NoticeBanner notice={notice} />

      {notes.status === "error" && !notes.data && <ErrorState message={notes.error} onRetry={notes.reload} />}
      {!notes.data && notes.status === "loading" && <LoadingState label="Cargando notas…" />}
      {notes.data && notes.data.length === 0 && <p className="text-sm text-slate-500">Todavía no hay notas.</p>}
      {notes.data && notes.data.length > 0 && (
        <ul className="grid gap-2">
          {notes.data.map((note) => (
            <li key={note.id} className="flex items-start justify-between gap-3 rounded-md bg-slate-50 p-3">
              <div>
                <p className="whitespace-pre-line text-sm text-slate-800">{note.content}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(note.created_at).toLocaleString("es-ES")}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                disabled={busy !== null}
                aria-label="Eliminar nota"
                className="shrink-0 rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                {busy === note.id ? "Eliminando…" : "Eliminar"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
