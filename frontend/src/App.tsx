import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FileUpload from "./components/FileUpload";
import AnalysisResult from "./components/AnalysisResult";
import AnalysisList from "./components/AnalysisList";
import SplashScreen from "./components/SplashScreen";
import Footer from "./components/Footer";
import { analyzeFile, fetchAnalyses, fetchAnalysisById } from "./services/api";
import type { AnalysisResult as AnalysisResultType, AnalysisSummary } from "./types/analysis";

export default function App() {
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [error, setError] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3200);
    return () => clearTimeout(t);
  }, []);

  async function loadAnalyses() {
    try { setAnalyses(await fetchAnalyses()); }
    catch { setError("Failed to load analyses from storage."); }
  }

  useEffect(() => { loadAnalyses(); }, []);

  async function handleUpload(file: File) {
    try { setError(""); setResult(await analyzeFile(file)); await loadAnalyses(); }
    catch { setError("Upload or analysis failed — check backend connection."); }
  }

  async function handleSelect(id: string) {
    try { setError(""); setResult(await fetchAnalysisById(id)); }
    catch { setError("Failed to retrieve case."); }
  }

  const activeFilename = result?.filename ?? null;
  const activeVerdict  = result?.verdict?.verdict ?? null;
  const activeScore    = result?.verdict?.final_score ?? null;
  const activeSHA      = result?.sha256 ?? null;

  function verdictColor(v: string | null) {
    if (!v) return "#52505f";
    const s = v.toLowerCase();
    if (s === "malicious" || s === "high" || s === "critical") return "#f87171";
    if (s === "suspicious" || s === "medium") return "#fbbf24";
    return "#34d399";
  }
  const vc = verdictColor(activeVerdict);

  const NAV = [
    { label: "Home", href: "https://zylox.space", home: true },
    { label: "New Analysis", onClick: () => document.getElementById("upload-panel")?.scrollIntoView({ behavior: "smooth" }), accent: true },
    { label: "API Docs", href: "http://127.0.0.1:8000/docs" },
    { label: "GitHub", href: "https://github.com/zyloxweeb" },
  ];

  return (
    <>
      <SplashScreen show={showSplash} />

      <div style={{ minHeight: "100vh", background: "#09090f", color: "#f1f0f5", position: "relative" }}>
        {/* subtle mesh */}
        <div className="pointer-events-none fixed inset-0" style={{
          background: "radial-gradient(ellipse 70% 40% at 15% 0%, rgba(124,58,237,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 30% at 85% 100%, rgba(124,58,237,0.04) 0%, transparent 60%)",
        }} />

        <div className="relative mx-auto" style={{ maxWidth: 1800, padding: "20px" }}>

          {/* ── HEADER ── */}
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: "#0f0f18",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "14px 22px",
              marginBottom: 18,
            }}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              {/* logo */}
              <div className="flex items-center gap-4">
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "rgba(124,58,237,0.12)",
                  border: "1px solid rgba(124,58,237,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <img src="/hood-icon.png" alt="NullTrace" style={{ width: 22, height: 22, objectFit: "contain", filter: "brightness(0) invert(1) opacity(0.8)" }} />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: "#f1f0f5", margin: 0, letterSpacing: "-0.02em" }}>
                      Null<span style={{ color: "#a78bfa" }}>Trace</span>
                    </h1>
                    <span style={{
                      fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "#a78bfa", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                      padding: "3px 10px", borderRadius: 99,
                    }}>
                      Forensic Workspace
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "#52505f", margin: "3px 0 0 0" }}>
                    Static analysis · trust classification · verdict engine
                  </p>
                </div>
              </div>

              {/* right side */}
              <div className="flex flex-col gap-3 xl:items-end">
                {/* active case chips */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "Active case", value: activeFilename ?? "No sample loaded", mono: false, color: activeFilename ? "#f1f0f5" : "#52505f" },
                    { label: "Verdict", value: activeVerdict ? String(activeVerdict).replace("_", " ") : "—", mono: false, color: vc },
                    { label: "Score", value: activeScore !== null ? String(activeScore) : "—", mono: true, color: vc },
                    { label: "Cases", value: String(analyses.length), mono: true, color: "#a78bfa" },
                  ].map(({ label, value, mono, color }) => (
                    <div key={label} style={{
                      background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 8, padding: "7px 14px", minWidth: 90,
                    }}>
                      <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52505f", margin: "0 0 3px 0" }}>{label}</p>
                      <p style={{
                        fontSize: 13, fontWeight: 600, color, margin: 0,
                        fontFamily: mono ? "'Fira Code', monospace" : "'Outfit', sans-serif",
                        maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        textTransform: "capitalize",
                      }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* nav buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {NAV.map((btn) =>
                    btn.href ? (
                      <a
                        key={btn.label}
                        href={btn.href}
                        target={btn.home ? "_self" : "_blank"}
                        rel={btn.home ? undefined : "noreferrer"}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: btn.home ? "#f1f0f5" : "#9d9baf",
                          background: btn.home ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
                          border: btn.home ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          padding: "7px 14px",
                          textDecoration: "none",
                          fontFamily: "'Outfit', sans-serif",
                          transition: "all 0.18s",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#f1f0f5"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = btn.home ? "#f1f0f5" : "#9d9baf";
                          e.currentTarget.style.borderColor = btn.home ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)";
                          e.currentTarget.style.background = btn.home ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)";
                        }}
                      >
                        {btn.home && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M1 5.5L6 1l5 4.5V11H8V8H4v3H1V5.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
                          </svg>
                        )}
                        {btn.label}
                      </a>
                    ) : (
                      <button key={btn.label} onClick={btn.onClick}
                        style={{
                          fontSize: 12, fontWeight: 500, color: "#a78bfa",
                          background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
                          borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                          fontFamily: "'Outfit', sans-serif", transition: "all 0.18s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.2)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.12)"; }}
                      >
                        {btn.label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.header>

          {/* ── ERROR ── */}
          {error && (
            <div style={{
              background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: 8, padding: "10px 16px", marginBottom: 16,
              fontSize: 13, color: "#f87171", display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="6.5" stroke="#f87171" strokeWidth="1" />
                <path d="M7 4v3M7 9.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {/* ── HERO ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            style={{
              background: "#0f0f18",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "28px 32px",
              marginBottom: 18,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* decorative element */}
            <div style={{
              position: "absolute", top: -60, right: -60,
              width: 220, height: 220, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#52505f", margin: "0 0 10px 0" }}>
              Analysis Canvas
            </p>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 700, color: "#f1f0f5", margin: "0 0 10px 0", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Inspect artifacts,{" "}
              <span style={{ color: "#a78bfa" }}>not dashboards</span>
            </h2>
            <p style={{ fontSize: 14, color: "#52505f", margin: 0, maxWidth: 600, lineHeight: 1.7 }}>
              Upload a sample, inspect technical indicators, classify trust signals and review the final verdict — all in a workspace built for analysis.
            </p>

            {activeSHA && (
              <div style={{
                marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#52505f",
                display: "flex", gap: 8,
              }}>
                <span style={{ color: "#a78bfa", flexShrink: 0 }}>SHA-256</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeSHA}</span>
              </div>
            )}
          </motion.div>

          {/* ── MAIN LAYOUT ── */}
          {/* Sidebar disabled — will be re-enabled when user auth/db is ready */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <motion.div id="upload-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: 0.1 }}>
              <FileUpload onUpload={handleUpload} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.15 }}
              style={{ background: "#0f0f18", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}
            >
              <AnalysisResult result={result} />
            </motion.div>
          </div>

          {/* ── SIDEBAR (disabled — re-enable when auth/db is ready) ── */}
          <aside style={{ display: "none" }}>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.38, delay: 0.1 }}
              style={{ background: "#0f0f18", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px" }}
            >
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52505f", margin: "0 0 14px 0" }}>
                Active Case
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Target", value: activeFilename ?? "No sample loaded", mono: false, color: activeFilename ? "#f1f0f5" : "#52505f" },
                  { label: "Verdict", value: activeVerdict ? String(activeVerdict).replace("_", " ") : "—", mono: false, color: vc, caps: true },
                  { label: "Score", value: activeScore !== null ? String(activeScore) : "—", mono: false, color: vc, large: true },
                  { label: "SHA-256", value: activeSHA ?? "—", mono: true, color: "#52505f" },
                ].map(({ label, value, mono, color, caps, large }) => (
                  <div key={label} style={{
                    background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 8, padding: "10px 12px",
                  }}>
                    <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52505f", margin: "0 0 4px 0" }}>{label}</p>
                    <p style={{
                      fontFamily: mono ? "'Fira Code', monospace" : "'Outfit', sans-serif",
                      fontSize: large ? 26 : mono ? 11 : 13,
                      fontWeight: large ? 800 : mono ? 400 : 500,
                      color, margin: 0, wordBreak: "break-all", lineHeight: large ? 1 : 1.4,
                      textTransform: caps ? "capitalize" : "none",
                    }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.42, delay: 0.14 }}
              style={{ background: "#0f0f18", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}
            >
              <AnalysisList analyses={analyses} onSelect={handleSelect} />
            </motion.div>
          </aside>
          
          <Footer />
        </div>
      </div>
    </>
  );
}