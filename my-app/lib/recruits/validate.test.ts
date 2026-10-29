import { describe, it, expect } from 'vitest'
import { parseRecruitForm } from './validate'
import { changedFields } from './fields'

function form(fields: Record<string, string | string[]>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) for (const item of [v].flat()) fd.append(k, item)
  return fd
}

describe('parseRecruitForm', () => {
  it('flags a missing graduation year (F1 acceptance test, Step 1)', () => {
    const { errors } = parseRecruitForm(form({ first_name: 'Test', last_name: 'Recruit', height: '5-10' }))
    expect(errors.graduation_year).toBeDefined()
  })

  it('accepts a valid recruit and stores height in inches (Step 2)', () => {
    const { values, errors } = parseRecruitForm(
      form({ first_name: 'Test', last_name: 'Recruit', height: '5-10', graduation_year: '2028', positions: ['PG'] }),
    )
    expect(errors).toEqual({})
    expect(values.height_inches).toBe(70)
    expect(values.graduation_year).toBe(2028)
    expect(values.positions).toEqual(['PG'])
  })

  it('rejects bad email and phone', () => {
    const { errors } = parseRecruitForm(
      form({ first_name: 'A', last_name: 'B', graduation_year: '2028', recruit_email: 'nope', recruit_phone: '123' }),
    )
    expect(errors.recruit_email).toBeDefined()
    expect(errors.recruit_phone).toBeDefined()
  })

  it('keeps only filled-in guardians', () => {
    const { values } = parseRecruitForm(
      form({ first_name: 'A', last_name: 'B', graduation_year: '2028', guardian1_name: 'Pat', guardian1_phone: '(410) 555-0100' }),
    )
    expect(values.guardian_contacts).toHaveLength(1)
  })
})

describe('changedFields', () => {
  it('finds only the fields that differ', () => {
    const base = parseRecruitForm(form({ first_name: 'A', last_name: 'B', graduation_year: '2028' })).values
    expect(changedFields(base, { ...base, high_school: 'Westfield' })).toEqual(['high_school'])
  })
})
