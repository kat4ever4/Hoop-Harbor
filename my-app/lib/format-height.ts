export function formatHeight(input: string): string | null {
  const match = input.trim().match(/^(\d)\s*[-' ]\s*(\d{1,2})\s*"?$/)
  if (!match) return null
  const feet = Number(match[1])
  const inches = Number(match[2])
  if (inches > 11) return null
  return `${feet}'${inches}"`
}
