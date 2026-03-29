import type { AnalysisSummary } from "../types/analysis";

type Props = {
  analyses: AnalysisSummary[];
  onSelect: (id: string) => Promise<void>;
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function verdictStyle(severity: string): { color: string; bg: string; border: string } {
  const s = severity?.toLowerCase();
  if (s === "malicious" || s === "high" || s === "critical")
    return { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.18)" };
  if (s === "suspicious" || s === "medium")
    return { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.18)" };
  return { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.18)" };
}

export default function AnalysisList({ analyses, onSelect }: Props) {
  return (
    <div style={{ padding: "16px" }}>
      {/* header */}
      <div className="mb-4">
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52505f", margin: "0 0 4px 0" }}>
          Recent Cases
        </p>
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f0f5", margin: 0 }}>Navigator</h3>
          <span style={{
            fontSize: 11,
            fontFamily: "'Fira Code', monospace",
            color: "#52505f",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "2px 8px",
            borderRadius: 6,
          }}>
            {analyses.length} records
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 12 }} />

      {analyses.length === 0 ? (
        <div style={{
          border: "1px dashed rgba(255,255,255,0.07)",
          borderRadius: 8,
          padding: "20px",
          textAlign: "center",
          fontSize: 13,
          color: "#52505f",
        }}>
          No cases in database
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {analyses.map((a) => {
            const vs = verdictStyle(a.severity);
            return (
              <button
                key={a.analysis_id}
                onClick={() => onSelect(a.analysis_id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  cursor: "pointer",
                  transition: "border-color 0.18s, background 0.18s",
                  fontFamily: "'Outfit', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)";
                  e.currentTarget.style.background = "rgba(124,58,237,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.background = "rgba(0,0,0,0.25)";
                }}
              >
                {/* top row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#f1f0f5", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {a.filename}
                  </p>
                  {/* verdict chip */}
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: vs.color,
                    background: vs.bg,
                    border: `1px solid ${vs.border}`,
                    padding: "2px 8px",
                    borderRadius: 99,
                    flexShrink: 0,
                  }}>
                    {a.severity}
                  </span>
                </div>

                {/* meta */}
                <p style={{ fontSize: 11, color: "#52505f", margin: "0 0 10px 0" }}>
                  {a.mime_type} · {a.file_category}
                </p>

                {/* stats */}
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontSize: 10, color: "#52505f", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Score</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: vs.color, margin: 0, lineHeight: 1 }}>{a.score}</p>
                  </div>
                  <p style={{ fontSize: 11, color: "#52505f", fontFamily: "'Fira Code', monospace" }}>
                    {formatDate(a.created_at)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}