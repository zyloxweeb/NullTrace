import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type Props = { show: boolean };

const STEPS = [
  "Initializing static analyzer",
  "Loading signature database",
  "Mounting entropy module",
  "Starting IOC extractor",
  "Verdict engine online",
];

export default function SplashScreen({ show }: Props) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!show) return;
    setStep(0);
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i < STEPS.length) {
        setStep(i);
      } else {
        setDone(true);
        clearInterval(id);
      }
    }, 360);
    return () => clearInterval(id);
  }, [show]);

  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "#09090f" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
        >
          {/* radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)",
            }}
          />

          <div className="relative w-full max-w-sm px-6">
            {/* logo + name */}
            <motion.div
              className="mb-10 flex items-center gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(124,58,237,0.14)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/hood-icon.png"
                  alt="NullTrace"
                  style={{
                    width: 28,
                    height: 28,
                    objectFit: "contain",
                    filter: "brightness(0) invert(1) opacity(0.85)",
                    userSelect: "none",
                  }}
                />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#f1f0f5",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Null<span style={{ color: "#a78bfa" }}>Trace</span>
                </h1>
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 12,
                    color: "#52505f",
                    margin: 0,
                    fontWeight: 400,
                  }}
                >
                  Forensic Analysis Workspace
                </p>
              </div>
            </motion.div>

            {/* steps */}
            <motion.div
              className="mb-6 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {STEPS.map((s, i) => {
                const isActive = i === step && !done;
                const isDone = i < step || done;
                return (
                  <div key={s} className="flex items-center gap-3">
                    {/* indicator */}
                    <div style={{ width: 16, height: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isDone ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="7" fill="rgba(124,58,237,0.2)" />
                          <path d="M4 7l2 2 4-4" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : isActive ? (
                        <div
                          className="animate-spin-slow"
                          style={{
                            width: 13,
                            height: 13,
                            borderRadius: "50%",
                            border: "2px solid rgba(167,139,250,0.15)",
                            borderTopColor: "#a78bfa",
                          }}
                        />
                      ) : (
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 13,
                        color: isDone ? "#9d9baf" : isActive ? "#f1f0f5" : "#52505f",
                        fontWeight: isActive ? 500 : 400,
                        transition: "color 0.3s",
                      }}
                    >
                      {s}
                    </span>
                    {isDone && (
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#52505f", fontFamily: "'Outfit', sans-serif" }}>
                        OK
                      </span>
                    )}
                  </div>
                );
              })}
            </motion.div>

            {/* progress */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  style={{ background: "linear-gradient(90deg, #7c3aed, #a78bfa)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <div
                className="mt-2 flex justify-between"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#52505f" }}
              >
                <span>Loading workspace</span>
                <span>{pct}%</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}