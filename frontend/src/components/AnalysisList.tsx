import type { AnalysisSummary } from "../types/analysis";
import SeverityBadge from "./SeverityBadge";

type Props = {
  analyses: AnalysisSummary[];
  onSelect: (analysisId: string) => Promise<void>;
};

function formatDate(value?: string) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AnalysisList({ analyses, onSelect }: Props) {
  return (
    <section className="bg-transparent p-3">
      <div className="mb-5 px-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
          Recent Cases
        </p>
        <h3 className="text-2xl font-semibold tracking-tight text-white">
          Navigator
        </h3>
        <p className="mt-2 text-sm leading-7 text-slate-400">
          Open a previous case and continue the review.
        </p>
      </div>

      {analyses.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
          No cases available.
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <button
              key={analysis.analysis_id}
              onClick={() => onSelect(analysis.analysis_id)}
              className="block w-full rounded-2xl border border-slate-800 bg-slate-950/55 px-4 py-4 text-left transition hover:border-cyan-500/30 hover:bg-slate-900/80"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">
                    {analysis.filename}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {analysis.mime_type} • {analysis.file_category}
                  </p>
                </div>

                <SeverityBadge severity={analysis.severity} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Score
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {analysis.score}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Created
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {formatDate(analysis.created_at)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}