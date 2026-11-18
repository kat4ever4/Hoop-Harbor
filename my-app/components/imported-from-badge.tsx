// F5: "Imported from [sheet]" tag on a recruit's profile.
// Shows nothing for recruits typed in by hand (source is null).
export function ImportedFromBadge({ source }: { source?: string | null }) {
  if (!source) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-indigo-100">
      Imported from {source}
    </span>
  )
}