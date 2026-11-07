import { ACTIVITY_LABELS } from "@/lib/types";

const tones: Record<string, string> = {
  cafe: "bg-amber-900/40 text-amber-100 border-amber-500/20",
  billard: "bg-emerald-900/50 text-emerald-100 border-emerald-400/20",
  restaurant: "bg-orange-950/50 text-orange-100 border-orange-400/20",
  bonus: "bg-yellow-900/40 text-yellow-100 border-yellow-400/25",
  reward: "bg-sky-950/40 text-sky-100 border-sky-400/20",
  visit: "bg-stone-800/60 text-stone-100 border-stone-400/20",
  autre: "bg-stone-800/60 text-stone-100 border-stone-400/20",
  ajustement: "bg-stone-800/60 text-stone-100 border-stone-400/20",
};

export function ActivityBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs ${tones[type] ?? tones.autre}`}
    >
      {ACTIVITY_LABELS[type] ?? type}
    </span>
  );
}
