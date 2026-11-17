import { describe, it, expect } from 'vitest'
import { findLikelyDuplicates, isLikelyDuplicate, schoolKey } from './duplicates'

const jordan = { id: 'j1', first_name: 'Jordan', last_name: 'Smith', graduation_year: 2028, high_school: 'Westfield High School' }

describe('F4 duplicate rule (mirrors the acceptance test)', () => {
  it('Step 1: same name, year, and school → match', () => {
    const out = findLikelyDuplicates({ first_name: 'Jordan', last_name: 'Smith', graduation_year: 2028, high_school: 'Westfield High School' }, [jordan])
    expect(out.map((m) => m.id)).toEqual(['j1'])
  })
  it('Step 3: Jordyn vs Jordan, same year and school → match', () => {
    expect(isLikelyDuplicate({ first_name: 'Jordyn', last_name: 'Smith', graduation_year: 2028, high_school: 'Westfield High School' }, jordan)).toBe(true)
  })
  it('Step 4: different graduation year → no match', () => {
    expect(isLikelyDuplicate({ first_name: 'Jordan', last_name: 'Smith', graduation_year: 2030, high_school: 'Lincoln High School' }, jordan)).toBe(false)
  })
})

describe('edge cases', () => {
  it('different last name → no match', () => {
    expect(isLikelyDuplicate({ first_name: 'Jordan', last_name: 'Smyth', graduation_year: 2028, high_school: 'Westfield High School' }, jordan)).toBe(false)
  })
  it('same last name and year but nothing else in common → no match', () => {
    expect(isLikelyDuplicate({ first_name: 'Taylor', last_name: 'Smith', graduation_year: 2028, high_school: 'Lincoln HS' }, jordan)).toBe(false)
  })
  it('same club counts even with a different first name and school', () => {
    expect(isLikelyDuplicate(
      { first_name: 'Taylor', last_name: 'Smith', graduation_year: 2028, club_team: 'Philly Triple Threat' },
      { ...jordan, club_team: 'philly triple threat' },
    )).toBe(true)
  })
  it('ignores accents and apostrophes', () => {
    expect(isLikelyDuplicate(
      { first_name: 'Ana', last_name: 'Lopez', graduation_year: 2027 },
      { first_name: 'Ana María', last_name: 'López', graduation_year: 2027 },
    )).toBe(true)
    expect(isLikelyDuplicate(
      { first_name: 'Sarah', last_name: 'ONeil', graduation_year: 2027 },
      { first_name: 'Sarah', last_name: "O'Neil", graduation_year: 2027 },
    )).toBe(true)
  })
  it('matches a preferred name', () => {
    expect(isLikelyDuplicate(
      { first_name: 'Kate', last_name: 'Brown', graduation_year: 2029 },
      { first_name: 'Katherine', preferred_name: 'Kate', last_name: 'Brown', graduation_year: 2029 },
    )).toBe(true)
  })
  it('treats "HS" and "High School" the same', () => {
    expect(schoolKey('Westfield HS')).toBe(schoolKey('Westfield High School'))
  })
  it('two empty schools do not count as the same school', () => {
    expect(isLikelyDuplicate(
      { first_name: 'Taylor', last_name: 'Smith', graduation_year: 2028, high_school: '' },
      { first_name: 'Morgan', last_name: 'Smith', graduation_year: 2028, high_school: null },
    )).toBe(false)
  })
})