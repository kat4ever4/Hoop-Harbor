// Heights are typed like "5-10" or 5'10 and stored in the database as total inches (70).

const HEIGHT_PATTERN = /^(\d)\s*[-' ]\s*(\d{1,2})\s*"?$/

export function formatHeight(input: string): string | null {
  const inches = parseHeightToInches(input)
  return inches === null ? null : inchesToHeight(inches)
}

/** "5-10" -> 70. Returns null if the text is not a height. */
export function parseHeightToInches(input: string): number | null {
  const match = input.trim().match(HEIGHT_PATTERN)
  if (!match) return null
  const feet = Number(match[1])
  const inches = Number(match[2])
  if (inches > 11) return null
  return feet * 12 + inches
}

/** 70 -> 5'10" */
export function inchesToHeight(totalInches: number): string {
  return `${Math.floor(totalInches / 12)}'${totalInches % 12}"`
}

/** 70 -> "5-10", the format the edit form uses. */
export function inchesToInput(totalInches: number): string {
  return `${Math.floor(totalInches / 12)}-${totalInches % 12}`
}
