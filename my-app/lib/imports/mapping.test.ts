import { describe, expect, it } from 'vitest'
import { autoMap, duplicateTargets, guessField, IGNORE, missingRequired } from './mapping'

describe('guessField', () => {
  it('matches field names and labels in any spacing or case', () => {
    expect(guessField('First Name')).toBe('first_name')
    expect(guessField('graduation_year')).toBe('graduation_year')
    expect(guessField('HIGH-SCHOOL')).toBe('high_school')
  })
  it('matches common coach shorthand', () => {
    expect(guessField('Grad Year')).toBe('graduation_year')
    expect(guessField('Pos')).toBe('positions')
    expect(guessField('AAU')).toBe('club_team')
  })
  it('ignores headers it does not know', () => {
    expect(guessField('Favorite Color')).toBe(IGNORE)
    expect(guessField('')).toBe(IGNORE)
  })
})

describe('autoMap', () => {
  it('maps the sample sheet headers', () => {
    expect(autoMap(['First Name', 'Last Name', 'Grad Year', 'Position', 'High School'])).toEqual({
      'First Name': 'first_name',
      'Last Name': 'last_name',
      'Grad Year': 'graduation_year',
      Position: 'positions',
      'High School': 'high_school',
    })
  })
  it('never maps two columns to the same field', () => {
    const m = autoMap(['School', 'High School'])
    expect(m).toEqual({ School: 'high_school', 'High School': IGNORE })
  })
})

describe('missingRequired', () => {
  it('lists required fields that are not mapped', () => {
    expect(missingRequired({ A: 'first_name', B: IGNORE })).toEqual(['Last name', 'Graduation year'])
  })
  it('is empty when all required fields are mapped', () => {
    expect(missingRequired({ A: 'first_name', B: 'last_name', C: 'graduation_year' })).toEqual([])
  })
})

describe('duplicateTargets', () => {
  it('flags a field chosen twice', () => {
    expect(duplicateTargets({ A: 'first_name', B: 'first_name', C: IGNORE })).toEqual(['First name'])
  })
})