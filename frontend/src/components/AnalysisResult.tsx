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

// ── Download helpers ─────────────────────────────────────────────────────────

function downloadJSON(result: AnalysisResult) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nulltrace_${result.filename ?? "report"}_${result.sha256?.slice(0, 8) ?? "unknown"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(result: AnalysisResult) {
  const verdict = result.verdict ?? { final_score: 0, verdict: "unknown", confidence: "low", raw_risk_score: 0, trust_score: 0, reasons: [] };
  const risk = result.risk_assessment ?? { score: 0, severity: "low", reasons: [] };
  const iocs = result.iocs ?? { urls: [], ips: [], emails: [], domains: [] };
  const patterns = result.suspicious_patterns ?? [];
  const vs = verdictStyle(verdict.verdict);
  const color = scoreColor(verdict.final_score);
  const ts = new Date().toLocaleString("it-IT");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>NullTrace Report — ${result.filename ?? "Unknown"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Fira+Code:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#09090f;color:#f1f0f5;font-family:'Outfit',sans-serif;padding:40px;line-height:1.6}
  .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08)}
  .logo{font-size:28px;font-weight:800;letter-spacing:-0.03em}
  .logo span{color:#a78bfa}
  .badge{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#a78bfa;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);padding:4px 12px;border-radius:99px}
  .meta{font-size:12px;color:#52505f;font-family:'Fira Code',monospace;text-align:right}
  .verdict-bar{background:#0f0f18;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:20px}
  .verdict-bar h2{font-size:14px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#52505f;margin-bottom:8px}
  .filename{font-size:26px;font-weight:700;color:#f1f0f5;margin-bottom:12px;word-break:break-all}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;font-size:12px;color:#52505f}
  .score-row{display:flex;align-items:flex-end;gap:24px;margin-bottom:16px}
  .score-num{font-size:72px;font-weight:800;letter-spacing:-0.04em;line-height:1;color:${color}}
  .verdict-chip{padding:8px 18px;border-radius:8px;background:${vs.bg};border:1px solid ${vs.border};color:${vs.color};font-size:15px;font-weight:700;text-transform:capitalize;align-self:flex-end;margin-bottom:8px}
  .progress{height:5px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;margin-bottom:16px}
  .progress-fill{height:100%;background:linear-gradient(90deg,${color}88,${color});border-radius:99px;width:${Math.min(verdict.final_score, 100)}%}
  .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
  .stat{background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px}
  .stat-label{font-size:9px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#52505f;margin-bottom:4px}
  .stat-val{font-size:18px;font-weight:700;color:#f1f0f5}
  .section{background:#0f0f18;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:18px;margin-bottom:16px}
  .section-label{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#52505f;margin-bottom:4px}
  .section-title{font-size:16px;font-weight:600;color:#f1f0f5;margin-bottom:14px}
  .reason{border-left:2px solid rgba(124,58,237,0.4);padding-left:12px;font-size:13px;color:#9d9baf;margin-bottom:8px}
  .ioc-group{margin-bottom:14px}
  .ioc-label{font-size:11px;font-weight:600;color:#52505f;margin-bottom:6px}
  .chip{background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:5px 10px;font-family:'Fira Code',monospace;font-size:11px;color:#9d9baf;word-break:break-all;margin-bottom:4px}
  .pattern{border-radius:8px;padding:12px 14px;margin-bottom:10px}
  .pattern-name{font-family:'Fira Code',monospace;font-size:12px;margin-bottom:4px}
  .pattern-cat{font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#52505f;margin-bottom:4px}
  .pattern-desc{font-size:13px;color:#9d9baf}
  .identity-row{background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.05);border-radius:8px;padding:10px 12px;margin-bottom:6px}
  .identity-label{font-size:9px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#52505f;margin-bottom:3px}
  .identity-val{font-size:12px;color:#9d9baf;word-break:break-all;font-family:'Fira Code',monospace}
  .footer{margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#52505f;display:flex;justify-content:space-between}
  .empty{font-size:13px;color:#52505f}
  .no-detect{font-size:12px;color:#52505f}
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">Null<span>Trace</span></div>
    <div class="badge" style="margin-top:6px;display:inline-block">Forensic Report</div>
  </div>
  <div class="meta">
    <div>Generated: ${ts}</div>
    <div style="margin-top:4px">NullTrace · Static Analysis Platform</div>
  </div>
</div>

<div class="verdict-bar">
  <h2>Case File</h2>
  <div class="filename">${result.filename ?? "Unknown sample"}</div>
  <div class="chips">
    <span>${result.mime_type ?? "unknown"}</span>
    <span>·</span>
    <span>${result.file_category ?? "unknown"}</span>
    <span>·</span>
    <span style="font-family:'Fira Code',monospace">${result.size ?? 0} B</span>
  </div>
  <div class="score-row">
    <div class="score-num">${verdict.final_score}</div>
    <div class="verdict-chip">${String(verdict.verdict).replace("_", " ")}</div>
    <div style="flex:1"></div>
    <div style="text-align:right;align-self:flex-end;margin-bottom:8px">
      <div style="font-size:11px;color:#52505f">Confidence</div>
      <div style="font-size:14px;font-weight:600;color:#9d9baf;text-transform:capitalize">${verdict.confidence}</div>
    </div>
  </div>
  <div class="progress"><div class="progress-fill"></div></div>

  <div class="stats-grid">
    <div class="stat"><div class="stat-label">Raw Risk</div><div class="stat-val" style="color:${color}">${verdict.raw_risk_score}</div></div>
    <div class="stat"><div class="stat-label">Trust Score</div><div class="stat-val">${verdict.trust_score}</div></div>
    <div class="stat"><div class="stat-label">Entropy</div><div class="stat-val">${result.entropy ?? 0}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-label">Risk Narrative</div>
  <div class="section-title">Assessment Notes</div>
  ${risk.reasons.length === 0
    ? '<p class="empty">No additional notes.</p>'
    : risk.reasons.map(r => `<div class="reason">${r}</div>`).join("")}
</div>

<div class="section">
  <div class="section-label">Technical Exhibits</div>
  <div class="section-title">Indicators of Compromise</div>
  ${(["urls", "ips", "emails", "domains"] as const).map(key => `
    <div class="ioc-group">
      <div class="ioc-label">${key.toUpperCase()} (${(iocs as Record<string, string[]>)[key]?.length ?? 0})</div>
      ${(iocs as Record<string, string[]>)[key]?.length === 0
        ? '<div class="no-detect">None detected</div>'
        : (iocs as Record<string, string[]>)[key].slice(0, 8).map((item: string) => `<div class="chip">${item}</div>`).join("")
      }
    </div>
  `).join("")}
</div>

<div class="section">
  <div class="section-label">Pattern Analysis</div>
  <div class="section-title">Suspicious Indicators</div>
  ${patterns.length === 0
    ? '<p class="empty">No patterns detected.</p>'
    : patterns.map(p => {
        const ps = verdictStyle(p.severity);
        return `<div class="pattern" style="background:${ps.bg};border:1px solid ${ps.border}">
          <div class="pattern-name" style="color:${ps.color}">${p.pattern}</div>
          <div class="pattern-cat">${p.category}</div>
          <div class="pattern-desc">${p.description}</div>
        </div>`;
      }).join("")}
</div>

<div class="section">
  <div class="section-label">Fingerprint</div>
  <div class="section-title">Artifact Identity</div>
  ${[
    { label: "Filename", value: result.filename ?? "—", mono: false },
    { label: "MIME Type", value: result.mime_type ?? "—", mono: true },
    { label: "Category", value: result.file_category ?? "—", mono: false },
    { label: "SHA-256", value: result.sha256 ?? "—", mono: true },
    { label: "MD5", value: result.md5 ?? "—", mono: true },
  ].map(f => `
    <div class="identity-row">
      <div class="identity-label">${f.label}</div>
      <div class="identity-val" style="${f.mono ? "" : "font-family:'Outfit',sans-serif;font-size:13px"}">${f.value}</div>
    </div>
  `).join("")}
</div>

<div class="footer">
  <span>NullTrace — Static Analysis Platform by zylox</span>
  <span>${ts}</span>
</div>

<script>window.onload=()=>window.print()</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onafterprint = () => URL.revokeObjectURL(url);
  }
}

// ────────────────────────────────────────────────────────────────────────────

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
            {/* Verdict chip */}
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

            {/* Copy buttons */}
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

            {/* Download buttons */}
            <button
              onClick={() => downloadJSON(result)}
              style={{
                fontSize: 12, fontWeight: 500, color: "#a78bfa",
                background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.22)",
                borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                transition: "all 0.18s", display: "inline-flex", alignItems: "center", gap: 6,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.16)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.08)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.22)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v7M3.5 5.5l3 3 3-3M1 10h11v1.5H1z" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              JSON
            </button>

            <button
              onClick={() => downloadPDF(result)}
              style={{
                fontSize: 12, fontWeight: 500, color: "#a78bfa",
                background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.22)",
                borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                transition: "all 0.18s", display: "inline-flex", alignItems: "center", gap: 6,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.16)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.08)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.22)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v7M3.5 5.5l3 3 3-3M1 10h11v1.5H1z" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              PDF
            </button>
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