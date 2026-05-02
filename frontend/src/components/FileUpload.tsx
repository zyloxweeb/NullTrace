import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = { onUpload: (file: File) => Promise<void> };

const LOG_STEPS = [
  { pct: 15, msg: "Extracting strings…" },
  { pct: 35, msg: "Running entropy analysis…" },
  { pct: 55, msg: "Matching suspicious patterns…" },
  { pct: 72, msg: "Computing IOC indicators…" },
  { pct: 88, msg: "Scoring risk & trust…" },
  { pct: 97, msg: "Generating verdict…" },
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB — must match backend
const MAX_FILE_SIZE_LABEL = "50 MB";

export default function FileUpload({ onUpload }: Props) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setSizeError(null);

    // Client-side size guard
    if (file.size > MAX_FILE_SIZE) {
      setSizeError(
        `File too large: ${(file.size / (1024 * 1024)).toFixed(1)} MB — maximum is ${MAX_FILE_SIZE_LABEL}.`
      );
      return;
    }

    setSelectedFile(file);
    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return Math.min(p + Math.random() * 15, 90);
      });
    }, 130);

    try {
      await onUpload(file);
      clearInterval(interval);
      setProgress(100);
    } finally {
      clearInterval(interval);
      setTimeout(() => { setLoading(false); setProgress(0); }, 700);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFile(e.target.files[0]);
    // Reset input so same file can be re-selected after an error
    e.target.value = "";
  };

  const pct = Math.min(Math.round(progress), 100);
  const visibleLogs = LOG_STEPS.filter((s) => pct >= s.pct);

  return (
    <div
      style={{
        background: "#0f0f18",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10,
        padding: "24px",
      }}
    >
      {/* header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52505f", margin: 0 }}>
            Ingest sample
          </p>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "#f1f0f5", margin: "4px 0 0 0" }}>
            Upload Artifact
          </h2>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 99,
            background: loading ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.1)",
            border: `1px solid ${loading ? "rgba(251,191,36,0.2)" : "rgba(52,211,153,0.2)"}`,
          }}
        >
          <div
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: loading ? "#fbbf24" : "#34d399",
            }}
          />
          <span style={{ fontSize: 11, color: loading ? "#fbbf24" : "#34d399", fontWeight: 500 }}>
            {loading ? "Analyzing" : "Ready"}
          </span>
        </div>
      </div>

      {/* size error banner */}
      <AnimatePresence>
        {sizeError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              background: "rgba(248,113,113,0.07)",
              border: "1px solid rgba(248,113,113,0.22)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#f87171",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6.5" stroke="#f87171" strokeWidth="1" />
              <path d="M7 4v3M7 9.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {sizeError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !loading && inputRef.current?.click()}
        style={{
          position: "relative",
          border: `1px dashed ${
            sizeError
              ? "rgba(248,113,113,0.35)"
              : dragging
              ? "rgba(124,58,237,0.5)"
              : "rgba(255,255,255,0.1)"
          }`,
          borderRadius: 8,
          background: sizeError
            ? "rgba(248,113,113,0.03)"
            : dragging
            ? "rgba(124,58,237,0.04)"
            : "rgba(0,0,0,0.2)",
          padding: "36px 24px",
          textAlign: "center",
          cursor: loading ? "default" : "pointer",
          transition: "border-color 0.2s, background 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
        />

        {/* upload icon */}
        <div
          style={{
            width: 44, height: 44, borderRadius: 10,
            background: sizeError ? "rgba(248,113,113,0.08)" : "rgba(124,58,237,0.1)",
            border: `1px solid ${sizeError ? "rgba(248,113,113,0.2)" : "rgba(124,58,237,0.2)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          {loading ? (
            <div
              className="animate-spin-slow"
              style={{
                width: 20, height: 20, borderRadius: "50%",
                border: "2px solid rgba(167,139,250,0.2)",
                borderTopColor: "#a78bfa",
              }}
            />
          ) : sizeError ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="#f87171" strokeWidth="1.5" />
              <path d="M10 6v5M10 13.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 13V4M10 4L7 7M10 4l3 3" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <p style={{ fontSize: 14, fontWeight: 500, color: sizeError ? "#f87171" : "#9d9baf", margin: "0 0 4px 0" }}>
          {loading
            ? selectedFile?.name
            : selectedFile && !sizeError
            ? selectedFile.name
            : sizeError
            ? "File rejected — choose another"
            : "Drop file here or click to browse"}
        </p>
        <p style={{ fontSize: 12, color: "#52505f", margin: 0 }}>
          {loading
            ? "Static analysis in progress"
            : `Any file type · max ${MAX_FILE_SIZE_LABEL} · local analysis only`}
        </p>
      </div>

      {/* progress */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 16 }}>
              <div className="flex justify-between mb-2" style={{ fontSize: 12 }}>
                <span style={{ color: "#9d9baf" }}>Analysis progress</span>
                <span style={{ color: "#a78bfa", fontFamily: "'Fira Code', monospace", fontSize: 11 }}>{pct}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ background: "linear-gradient(90deg, #7c3aed, #a78bfa)", width: `${pct}%` }}
                />
              </div>

              {/* live log */}
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                <AnimatePresence initial={false}>
                  {visibleLogs.map((s) => (
                    <motion.div
                      key={s.msg}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="6" fill="rgba(124,58,237,0.2)" />
                        <path d="M3.5 6l2 2 3-3" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: 12, color: "#52505f" }}>{s.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* footer */}
      <div className="mt-5 flex items-center gap-3">
        <button
          disabled={loading}
          onClick={() => !loading && inputRef.current?.click()}
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: 8,
            background: loading ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.14)",
            border: "1px solid rgba(124,58,237,0.25)",
            color: loading ? "#52505f" : "#a78bfa",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'Outfit', sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.22)"; }}
          onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.14)"; }}
        >
          {loading ? "Analyzing…" : "Analyze Artifact"}
        </button>
        {selectedFile && !loading && !sizeError && (
          <span style={{ fontSize: 11, color: "#52505f", fontFamily: "'Fira Code', monospace", whiteSpace: "nowrap" }}>
            {(selectedFile.size / 1024).toFixed(1)} KB
          </span>
        )}
      </div>
    </div>
  );
}