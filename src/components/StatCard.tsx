export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="stat">
      <p className="text-xs uppercase tracking-[0.14em] text-cream/50">{label}</p>
      <p className="mt-2 font-display text-3xl text-cream">{value}</p>
      {hint ? <p className="mt-1 text-xs text-cream/45">{hint}</p> : null}
    </div>
  );
}
