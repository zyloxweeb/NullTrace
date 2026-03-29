import type { AnalysisResult } from "../types/analysis";
import { motion } from "framer-motion";

type Props = { result: AnalysisResult | null };

function copy(text: string) { navigator.clipboard.writeText(text).catch(() => {}); }

function scoreColor(s: number) {
  if (s >= 75) return "#f87171";
  if (s >= 40) return "#fbbf24";
  return "#34d399";
}

function verdictStyle(v: string) {
  const s = v?.toLowerCase();
  if (s === "malicious" || s === "high" || s === "critical")
    return { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" };
  if (s === "suspicious" || s === "medium")
    return { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" };
  return { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" };
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.3)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 6,
      padding: "6px 10px",
      fontSize: 12,
      color: "#9d9baf",
      fontFamily: "'Fira Code', monospace",
      wordBreak: "break-all",
    }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, color, large }: { label: string; value: string | number; color?: string; large?: boolean }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "12px 14px" }}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52505f", margin: "0 0 6px 0" }}>{label}</p>
      <p style={{ fontSize: large ? 28 : 16, fontWeight: 700, color: color ?? "#f1f0f5", margin: 0, lineHeight: 1 }}>{value}</p>
    </div>
  );
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#0f0f18", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "18px" }}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52505f", margin: "0 0 4px 0" }}>{label}</p>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f0f5", margin: "0 0 14px 0" }}>{title}</h3>
      {children}
    </div>
  );
}

function IOCGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#52505f", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        <span style={{ fontSize: 10, fontFamily: "'Fira Code', monospace", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "1px 6px", color: "#52505f" }}>
          {items.length}
        </span>
      </p>
      {items.length === 0 ? (
        <p style={{ fontSize: 12, color: "#52505f" }}>None detected</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.slice(0, 8).map((item, i) => <Chip key={i}>{item}</Chip>)}
          {items.length > 8 && <p style={{ fontSize: 11, color: "#52505f" }}>+{items.length - 8} more</p>}
        </div>
      )}
    </div>
  );
}

export default function AnalysisResult({ result }: Props) {
  if (!result) {
    return (
      <div style={{ padding: "20px" }}>
        <div style={{
          minHeight: 440,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed rgba(255,255,255,0.07)",
          borderRadius: 10,
          gap: 10,
          textAlign: "center",
          padding: 32,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 3L3 7v8l8 4 8-4V7l-8-4z" stroke="#a78bfa" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M11 3v12M3 7l8 4 8-4" stroke="#a78bfa" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#9d9baf", margin: 0 }}>No case selected</h3>
          <p style={{ fontSize: 13, color: "#52505f", margin: 0, maxWidth: 280, lineHeight: 1.6 }}>
            Upload a sample or open a case from the navigator to begin analysis.
          </p>
        </div>
      </div>
    );
  }

  const risk = result.risk_assessment ?? { score: 0, severity: "low", reasons: [] };
  const verdict = result.verdict ?? {
    raw_risk_score: risk.score, trust_score: 0, final_score: risk.score,
    verdict: risk.severity, confidence: "low", reasons: [],
  };
  const iocs = result.iocs ?? { urls: [], ips: [], emails: [], domains: [] };
  const strings = result.strings ?? [];
  const patterns = result.suspicious_patterns ?? [];
  const totalIocs = iocs.urls.length + iocs.ips.length + iocs.emails.length + iocs.domains.length;
  const color = scoreColor(verdict.final_score);
  const vs = verdictStyle(verdict.verdict);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* CASE HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: "#0f0f18", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "20px" }}
      >
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div className="min-w-0">
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52505f", margin: "0 0 6px 0" }}>
              Case File
            </p>
            <h2 style={{ fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 700, color: "#f1f0f5", margin: "0 0 10px 0", wordBreak: "break-word" }}>
              {result.filename ?? "Unknown sample"}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 12, color: "#52505f" }}>
              <span>{result.mime_type ?? "unknown"}</span>
              <span>·</span>
              <span>{result.file_category ?? "unknown"}</span>
              <span>·</span>
              <span style={{ fontFamily: "'Fira Code', monospace" }}>{result.size ?? 0} B</span>
              {result.cached && <><span>·</span><span style={{ color: "#a78bfa" }}>cached</span></>}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <div style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: vs.bg,
              border: `1px solid ${vs.border}`,
            }}>
              <p style={{ fontSize: 10, color: "#52505f", margin: "0 0 2px 0" }}>Verdict</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: vs.color, margin: 0, textTransform: "capitalize" }}>
                {String(verdict.verdict).replace("_", " ")}
              </p>
            </div>
            {[
              { label: "Copy SHA-256", value: result.sha256 ?? "" },
              { label: "Copy MD5", value: result.md5 ?? "" },
            ].map(({ label, value }) => (
              <button key={label} onClick={() => copy(value)}
                style={{
                  fontSize: 12, fontWeight: 500, color: "#9d9baf",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#f1f0f5"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#9d9baf"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* THREAT METER */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        style={{ background: "#0f0f18", border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, padding: "20px" }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52505f", margin: "0 0 4px 0" }}>
              Threat Index
            </p>
            <p style={{ fontSize: 56, fontWeight: 800, color, margin: 0, lineHeight: 1, letterSpacing: "-0.03em" }}>
              {verdict.final_score}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "#52505f", margin: 0 }}>Confidence</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#9d9baf", margin: "2px 0 0 0", textTransform: "capitalize" }}>
              {verdict.confidence}
            </p>
          </div>
        </div>

        <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
          <motion.div
            style={{ height: "100%", background: `linear-gradient(90deg, ${color}aa, ${color})`, borderRadius: 99 }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(verdict.final_score, 100)}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#52505f" }}>
          <span>Low</span><span>Medium</span><span>High</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <StatCard label="Raw Risk" value={verdict.raw_risk_score} color={color} large />
          <StatCard label="Trust Score" value={verdict.trust_score} />
          <StatCard label="Entropy" value={result.entropy ?? 0} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <StatCard label="Indicators" value={totalIocs} />
          <StatCard label="Patterns" value={patterns.length} />
          <StatCard label="Strings" value={strings.length} />
        </div>
      </motion.div>

      {/* BODY GRID */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Assessment Notes */}
          <Section label="Risk Narrative" title="Assessment Notes">
            {risk.reasons.length === 0
              ? <p style={{ fontSize: 13, color: "#52505f" }}>No additional notes.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {risk.reasons.map((r, i) => (
                    <div key={i} style={{ borderLeft: "2px solid rgba(124,58,237,0.3)", paddingLeft: 12, fontSize: 13, color: "#9d9baf", lineHeight: 1.65 }}>
                      {r}
                    </div>
                  ))}
                </div>
            }
          </Section>

          {/* IOCs */}
          <Section label="Technical Exhibits" title="Indicators of Compromise">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <IOCGroup label="URLs" items={iocs.urls} />
              <IOCGroup label="IPs" items={iocs.ips} />
              <IOCGroup label="Emails" items={iocs.emails} />
              <IOCGroup label="Domains" items={iocs.domains} />
            </div>
          </Section>

          {/* Strings */}
          <Section label="Evidence Fragments" title="Extracted Strings">
            {strings.length === 0
              ? <p style={{ fontSize: 13, color: "#52505f" }}>No strings extracted.</p>
              : <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                  {strings.slice(0, 40).map((s, i) => <Chip key={i}>{s}</Chip>)}
                </div>
            }
          </Section>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Suspicious Patterns */}
          <Section label="Pattern Analysis" title="Suspicious Indicators">
            {patterns.length === 0
              ? <p style={{ fontSize: 13, color: "#52505f" }}>No patterns detected.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {patterns.map((item, i) => {
                    const ps = verdictStyle(item.severity);
                    return (
                      <div key={`${item.pattern}-${i}`} style={{
                        background: ps.bg,
                        border: `1px solid ${ps.border}`,
                        borderRadius: 8,
                        padding: "12px 14px",
                      }}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: ps.color, margin: 0, wordBreak: "break-all" }}>
                            {item.pattern}
                          </p>
                          <span style={{
                            fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                            color: ps.color, background: ps.bg, border: `1px solid ${ps.border}`,
                            borderRadius: 99, padding: "2px 8px", flexShrink: 0,
                          }}>
                            {item.severity}
                          </span>
                        </div>
                        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#52505f", margin: "0 0 6px 0" }}>
                          {item.category}
                        </p>
                        <p style={{ fontSize: 13, color: "#9d9baf", margin: 0, lineHeight: 1.6 }}>{item.description}</p>
                      </div>
                    );
                  })}
                </div>
            }
          </Section>

          {/* Identity */}
          <Section label="Fingerprint" title="Artifact Identity">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Filename", value: result.filename ?? "—", mono: false },
                { label: "MIME Type", value: result.mime_type ?? "—", mono: true },
                { label: "Category", value: result.file_category ?? "—", mono: false },
                { label: "SHA-256", value: result.sha256 ?? "—", mono: true },
                { label: "MD5", value: result.md5 ?? "—", mono: true },
              ].map(({ label, value, mono }) => (
                <div key={label} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52505f", margin: "0 0 4px 0" }}>{label}</p>
                  <p style={{ fontFamily: mono ? "'Fira Code', monospace" : "inherit", fontSize: mono ? 11 : 13, color: "#9d9baf", margin: 0, wordBreak: "break-all" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}