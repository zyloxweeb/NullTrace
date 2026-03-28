type Props = {
  label?: string;
};

export default function LoadingSpinner({ label = "Loading..." }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );
}