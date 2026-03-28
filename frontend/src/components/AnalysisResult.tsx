import type { AnalysisResult } from "../types/analysis";
import SeverityBadge from "./SeverityBadge";
import { motion } from "framer-motion";

type Props = {
  result: AnalysisResult | null;
};

function AnimatedBlock({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function getScoreTone(score: number) {
  if (score >= 75) return "from-red-500 to-red-300";
  if (score >= 40) return "from-amber-400 to-yellow-200";
  return "from-emerald-400 to-cyan-300";
}

function ScoreMeter({ score }: { score: number }) {
  const width = Math.max(6, Math.min(score, 100));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Threat Index
          </p>
          <p className="mt-2 text-4xl font-semibold text-white">{score}</p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Scale
          </p>
          <p className="mt-2 text-sm text-slate-300">0 — 100</p>
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-900">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getScoreTone(score)} transition-all duration-700`}
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between text-[11px] uppercase tracking-[0.18em] text-slate-600">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-medium text-slate-200">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 break-all text-sm text-slate-200 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EvidenceChip({ text }: { text: string }) {
  return (
    <div className="max-w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
      <p className="break-all whitespace-normal leading-6">{text}</p>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/45 p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

export default function AnalysisResult({ result }: Props) {
  if (!result) {
    return (
      <section className="h-full rounded-[26px] bg-transparent p-4 md:p-5">
        <div className="flex min-h-[640px] items-center justify-center rounded-[24px] border border-dashed border-slate-800 bg-slate-950/40 text-center">
          <div className="max-w-md px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-400">
              Case Overview
            </p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              No case selected
            </h3>
            <p className="mt-3 text-base leading-7 text-slate-400">
              Ingest a sample or open one of the recent cases from the navigator.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const riskAssessment = result.risk_assessment ?? {
    score: 0,
    severity: "low",
    reasons: [],
  };
  
  const verdict = result.verdict ?? {
  raw_risk_score: riskAssessment.score,
  trust_score: 0,
  final_score: riskAssessment.score,
  verdict: riskAssessment.severity,
  confidence: "low",
  reasons: [],
  };

  const trustAssessment = result.trust_assessment ?? {
    trust_score: 0,
    is_likely_installer: false,
    has_benign_cert_infrastructure: false,
    matched_cert_keywords: [],
    matched_installer_hints: [],
    reasons: [],
  };

  const suspiciousPatterns = result.suspicious_patterns ?? [];
  const iocs = result.iocs ?? {
    urls: [],
    ips: [],
    emails: [],
    domains: [],
  };
  const strings = result.strings ?? [];

  const totalIocs =
    iocs.urls.length + iocs.ips.length + iocs.emails.length + iocs.domains.length;

  return (
    <section className="h-full rounded-[26px] bg-transparent p-4 md:p-5">
      {/* HEADER */}
      <AnimatedBlock delay={3}>
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/45 p-5">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-400">
              Case File
            </p>

            <h2 className="mt-3 truncate text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {result.filename ?? "Unknown sample"}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span>{result.mime_type ?? "unknown"}</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span>{result.file_category ?? "unknown"}</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span>{result.size ?? 0} bytes</span>
              {result.cached && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span className="text-cyan-300">cached result</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SeverityBadge severity={verdict.verdict} />
            <button
              onClick={() => copyToClipboard(result.sha256 ?? "")}
              className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-900"
            >
              Copy SHA-256
            </button>
            <button
              onClick={() => copyToClipboard(result.md5 ?? "")}
              className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-900"
            >
              Copy MD5
            </button>
          </div>
        </div>
      </div>
      </AnimatedBlock>

      {/* SCORE + STATS */}
      <div className="mb-6 space-y-4">
        <ScoreMeter score={verdict.final_score} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SmallStat label="Entropy" value={result.entropy ?? 0} />
          <SmallStat label="Indicators" value={totalIocs} />
          <SmallStat label="Patterns" value={suspiciousPatterns.length} />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SmallStat label="Raw Risk" value={verdict.raw_risk_score} />
          <SmallStat label="Trust Score" value={verdict.trust_score} />
          <SmallStat label="Confidence" value={verdict.confidence} />
        </div>
      </div>

      {/* MAIN BODY */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        
        <div className="space-y-6">
          <Section eyebrow="Risk Narrative" title="Assessment Notes">
            {riskAssessment.reasons.length === 0 ? (
              <p className="text-sm text-slate-500">
                No additional assessment notes available.
              </p>
            ) : (
              <div className="space-y-3">
                {riskAssessment.reasons.map((reason, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4"
                  >
                    <p className="text-sm leading-7 text-slate-300">{reason}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section eyebrow="Technical Exhibits" title="Indicators of Compromise">
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  URLs
                </p>
                <div className="mt-3 space-y-2">
                  {iocs.urls.length ? (
                    <>
                      {iocs.urls.slice(0, 8).map((item, index) => (
                        <EvidenceChip key={index} text={item} />
                      ))}
                      {iocs.urls.length > 8 && (
                        <p className="text-sm text-slate-500">
                          +{iocs.urls.length - 8} more URLs
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">None</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  IPs
                </p>
                <div className="mt-3 space-y-2">
                  {iocs.ips.length ? (
                    <>
                      {iocs.ips.slice(0, 8).map((item, index) => (
                        <EvidenceChip key={index} text={item} />
                      ))}
                      {iocs.ips.length > 8 && (
                        <p className="text-sm text-slate-500">
                          +{iocs.ips.length - 8} more IPs
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">None</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Emails
                </p>
                <div className="mt-3 space-y-2">
                  {iocs.emails.length ? (
                    <>
                      {iocs.emails.slice(0, 8).map((item, index) => (
                        <EvidenceChip key={index} text={item} />
                      ))}
                      {iocs.emails.length > 8 && (
                        <p className="text-sm text-slate-500">
                          +{iocs.emails.length - 8} more EMAILs
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">None</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Domains
                </p>
                <div className="mt-3 space-y-2">
                  {iocs.domains.length ? (
                    <>
                      {iocs.domains.slice(0, 8).map((item, index) => (
                        <EvidenceChip key={index} text={item} />
                      ))}
                      {iocs.domains.length > 8 && (
                        <p className="text-sm text-slate-500">
                          +{iocs.domains.length - 8} more Domains
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">None</p>
                  )}
                </div>
              </div>
            </div>
          </Section>

          <Section eyebrow="Evidence Fragments" title="Extracted Strings">
            {strings.length === 0 ? (
              <p className="text-sm text-slate-500">
                No relevant strings were extracted.
              </p>
            ) : (
              <div className="max-h-[360px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/65 p-3">
                <div className="grid grid-cols-1 gap-2">
                  {strings.slice(0, 40).map((str, index) => (
                    <EvidenceChip key={index} text={str} />
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section eyebrow="Pattern Analysis" title="Suspicious Indicators">
            {suspiciousPatterns.length === 0 ? (
              <p className="text-sm text-slate-500">
                No suspicious patterns detected.
              </p>
            ) : (
              <div className="space-y-3">
                {suspiciousPatterns.map((item, index) => (
                  <div
                    key={`${item.pattern}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all font-mono text-base text-cyan-300">
                          {item.pattern}
                        </p>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                          {item.category}
                        </p>
                      </div>

                      <SeverityBadge severity={item.severity} />
                    </div>

                    <p className="text-sm leading-7 text-slate-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section eyebrow="Fingerprint" title="Artifact Identity">
            <div className="space-y-4">
              <Field label="File name" value={result.filename ?? "Unknown"} />
              <Field
                label="MIME type"
                value={result.mime_type ?? "application/octet-stream"}
              />
              <Field
                label="Category"
                value={result.file_category ?? "unknown"}
              />
              <Field label="SHA-256" value={result.sha256 ?? "N/A"} mono />
              <Field label="MD5" value={result.md5 ?? "N/A"} mono />
            </div>
          </Section>
        </div>
      </div>
    </section>
  );
}