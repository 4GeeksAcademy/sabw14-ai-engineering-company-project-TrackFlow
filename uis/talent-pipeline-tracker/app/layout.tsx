import type { Metadata } from "next";
import Link from "next/link";

import { PROCESS } from "@/lib/labels";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talent Pipeline Tracker · TrackFlow",
  description: `Seguimiento de candidaturas — ${PROCESS.position}, ${PROCESS.location}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="font-extrabold text-blue-900">
              TrackFlow <span className="font-semibold text-slate-500">· Talent Pipeline</span>
            </Link>
            <nav aria-label="Principal" className="flex gap-2 text-sm">
              <Link href="/" className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100">Candidaturas</Link>
              <Link href="/candidates/new" className="rounded-md bg-blue-700 px-3 py-2 font-semibold text-white hover:bg-blue-800">
                Nueva candidatura
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500">
          Herramienta interna · People &amp; Talent · {PROCESS.company}
        </footer>
      </body>
    </html>
  );
}
