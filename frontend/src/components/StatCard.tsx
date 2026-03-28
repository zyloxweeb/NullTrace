type Props = {
  label: string;
  value: string | number;
};

export default function StatCard({ label, value }: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="break-all text-sm text-slate-200">{value}</p>
    </div>
  );
}