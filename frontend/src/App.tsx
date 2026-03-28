import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FileUpload from "./components/FileUpload";
import AnalysisResult from "./components/AnalysisResult";
import AnalysisList from "./components/AnalysisList";
import SplashScreen from "./components/SplashScreen";
import { analyzeFile, fetchAnalyses, fetchAnalysisById } from "./services/api";
import type {
  AnalysisResult as AnalysisResultType,
  AnalysisSummary,
} from "./types/analysis";

export default function App() {
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [error, setError] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  async function loadAnalyses() {
    try {
      const data = await fetchAnalyses();
      setAnalyses(data);
    } catch {
      setError("Errore nel caricamento delle analisi.");
    }
  }

  useEffect(() => {
    loadAnalyses();
  }, []);

  async function handleUpload(file: File) {
    try {
      setError("");
      const data = await analyzeFile(file);
      setResult(data);
      await loadAnalyses();
    } catch {
      setError("Errore durante l'upload o l'analisi del file.");
    }
  }

  async function handleSelectAnalysis(analysisId: string) {
    try {
      setError("");
      const data = await fetchAnalysisById(analysisId);
      setResult(data);
    } catch {
      setError("Errore durante il recupero del dettaglio.");
    }
  }

  function scrollToUpload() {
    const element = document.getElementById("upload-panel");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const activeFilename = result?.filename ?? "No active sample";
  const activeVerdict = result?.verdict?.verdict ?? "idle";
  const activeScore = result?.verdict?.final_score ?? 0;
  const activeFingerprint = result?.sha256 ?? "N/A";

  return (
    <>
      <SplashScreen show={showSplash} />

      <div className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-100">
        {/* background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/10 blur-[140px]" />
          <div className="absolute inset-0 opacity-[0.06]">
            <div className="h-[2px] w-full animate-[scan_6s_linear_infinite] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          </div>
        </div>

        <div className="relative mx-auto max-w-[1750px] px-5 py-5 md:px-8 md:py-8 xl:px-10 xl:py-10">
          {/* NEW HEADER */}
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 rounded-[30px] border border-slate-800/80 bg-slate-950/55 px-5 py-5 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              {/* LEFT */}
              <div className="min-w-0">
                <div className="flex items-center gap-4">
                  <img
                    src="/hood-icon.png"
                    alt="NullTrace"
                    className="h-12 w-12 object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        Null<span className="text-cyan-400">Trace</span>
                      </h1>

                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-300">
                        forensic workspace
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      Static analysis, trust classification and verdict-oriented artifact review.
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col gap-4 xl:items-end">
                {/* active case strip */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Active case
                    </p>
                    <p className="mt-1 max-w-[220px] truncate text-sm font-medium text-slate-200">
                      {activeFilename}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Verdict
                    </p>
                    <p className="mt-1 text-sm font-medium capitalize text-cyan-300">
                      {String(activeVerdict).replace("_", " ")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Score
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {activeScore}
                    </p>
                  </div>
                </div>

                {/* action buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={scrollToUpload}
                    className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                  >
                    New Analysis
                  </button>

                  <a
                    href="http://127.0.0.1:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500/30 hover:bg-slate-900"
                  >
                    API Docs
                  </a>

                  <a
                    href="https://github.com/zyloxweeb"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500/30 hover:bg-slate-900"
                  >
                    GitHub
                  </a>

                  <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
                    Cases: <span className="font-semibold text-white">{analyses.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* MAIN */}
            <div className="space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-[32px] border border-slate-800/80 bg-slate-950/45 p-6 md:p-8 backdrop-blur-xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
                  Analysis Canvas
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Inspect artifacts, not dashboards
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-400 md:text-base">
                  Upload a sample, inspect technical indicators, classify trust
                  signals and review the final verdict in a workspace designed
                  for analysis rather than admin management.
                </p>
              </motion.section>

              <motion.section
                id="upload-panel"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="rounded-[32px] border border-slate-800/80 bg-slate-950/45 p-2 backdrop-blur-xl transition duration-300 hover:scale-[1.005]"
              >
                <FileUpload onUpload={handleUpload} />
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="rounded-[32px] border border-slate-800/80 bg-slate-950/40 p-2 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(0,0,0,0.25)] transition duration-300 hover:scale-[1.003]"
              >
                <AnalysisResult result={result} />
              </motion.section>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-6">
              <motion.section
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="rounded-[32px] border border-slate-800/80 bg-slate-950/45 p-5 backdrop-blur-xl transition duration-300 hover:scale-[1.005]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                  Active Case
                </p>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                      Target
                    </p>
                    <p className="mt-2 break-all text-sm font-medium text-slate-200">
                      {activeFilename === "No active sample" ? "No sample loaded" : activeFilename}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                      Verdict
                    </p>
                    <p className="mt-2 text-sm font-medium text-cyan-300">
                      {String(activeVerdict).replace("_", " ")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                      Final Score
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {activeScore}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                      Fingerprint
                    </p>
                    <p className="mt-2 break-all font-mono text-xs text-slate-300">
                      {activeFingerprint}
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className="rounded-[32px] border border-slate-800/80 bg-slate-950/45 p-3 backdrop-blur-xl transition duration-300 hover:scale-[1.005]"
              >
                <AnalysisList analyses={analyses} onSelect={handleSelectAnalysis} />
              </motion.section>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}