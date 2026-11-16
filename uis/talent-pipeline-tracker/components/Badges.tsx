import { stageLabel, statusLabel } from "@/lib/labels";

const STATUS_STYLES: Record<string, string> = {
  received: "bg-slate-100 text-slate-800 ring-slate-300",
  in_progress: "bg-blue-50 text-blue-800 ring-blue-300",
  selected: "bg-emerald-50 text-emerald-800 ring-emerald-300",
  discarded: "bg-red-50 text-red-800 ring-red-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STATUS_STYLES[status] ?? STATUS_STYLES.received}`}>
      {statusLabel(status)}
    </span>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-300">
      {stageLabel(stage)}
    </span>
  );
}
