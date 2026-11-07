export function BrandMark({
  name,
  tagline,
  size = "md",
}: {
  name: string;
  tagline?: string;
  size?: "sm" | "md" | "lg";
}) {
  const titleClass =
    size === "lg"
      ? "text-5xl sm:text-7xl"
      : size === "sm"
        ? "text-xl"
        : "text-3xl sm:text-4xl";

  return (
    <div className="relative">
      <div
        className={`pulse-soft absolute -left-6 -top-4 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(224,168,46,0.35),transparent_70%)] blur-xl ${size === "lg" ? "sm:h-28 sm:w-28" : ""}`}
        aria-hidden
      />
      <p className="mb-2 text-xs uppercase tracking-[0.28em] text-amber-soft/80">
        Fidélité
      </p>
      <h1 className={`font-display ${titleClass} leading-[0.95] text-cream`}>
        {name}
      </h1>
      {tagline ? (
        <p className="mt-3 text-sm text-cream/65 sm:text-base">{tagline}</p>
      ) : null}
    </div>
  );
}
