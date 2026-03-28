type Props = {
  severity: string;
};

function getSeverityClasses(severity: string) {
  switch (severity) {
    case "high":
    case "high_risk":
      return "bg-red-500/10 text-red-300 ring-1 ring-red-500/20";
    case "medium":
    case "suspicious":
      return "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20";
    case "likely_benign":
      return "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20";
    case "benign":
    case "low":
    default:
      return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20";
  }
}

function formatSeverityLabel(severity: string) {
  switch (severity) {
    case "high_risk":
      return "high risk";
    case "likely_benign":
      return "likely benign";
    default:
      return severity.replace("_", " ");
  }
}

export default function SeverityBadge({ severity }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getSeverityClasses(
        severity
      )}`}
    >
      {formatSeverityLabel(severity)}
    </span>
  );
}