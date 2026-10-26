import { describe, it, expect } from 'vitest'
import { formatHeight } from './format-height'

describe('formatHeight', () => {
  it('converts dash format', () => expect(formatHeight('5-10')).toBe(`5'11"`))
  it('handles zero inches', () => expect(formatHeight('6-0')).toBe(`6'0"`))
  it('accepts apostrophe format', () => expect(formatHeight(`5'7`)).toBe(`5'7"`))
  it('rejects 12+ inches', () => expect(formatHeight('5-13')).toBeNull())
  it('rejects garbage', () => expect(formatHeight('tall')).toBeNull())
})
