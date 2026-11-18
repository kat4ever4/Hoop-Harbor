import { describe, expect, it } from 'vitest'
import { skippedCsv, skippedRows } from './skipped-csv'
import type { PreviewRow } from './types'

const rows: PreviewRow[] = [
  { rowNumber: 2, status: 'new', values: { first_name: 'Avery', last_name: 'Stone' } },
  { rowNumber: 3, status: 'error', values: { first_name: 'Taylor', last_name: 'Reed' }, reason: 'Graduation year must be 4 digits' },
  { rowNumber: 4, status: 'duplicate', values: { first_name: 'Reese', last_name: 'Brooks' }, reason: 'May already exist' },
  { rowNumber: 5, status: 'duplicate', values: { first_name: 'Sam', last_name: 'Lee' }, reason: 'May already exist' },
]

describe('skippedRows', () => {
  it('keeps errors and duplicates left on skip, drops new rows and duplicates set to create', () => {
    const out = skippedRows(rows, { 5: 'create' })
    expect(out.map((r) => r.rowNumber)).toEqual([3, 4])
  })
})

describe('skippedCsv', () => {
  it('writes a header plus one line per skipped row', () => {
    const csv = skippedCsv(skippedRows(rows, { 5: 'create' }))
    expect(csv.split('\n')).toEqual([
      'sheet_row,reason,first_name,last_name',
      '3,Graduation year must be 4 digits,Taylor,Reed',
      '4,May already exist,Reese,Brooks',
    ])
  })
  it('quotes cells that contain commas or quotes', () => {
    const csv = skippedCsv([{ rowNumber: 9, status: 'error', values: { high_school: 'St. Mary\'s, "North"' }, reason: 'x' }])
    expect(csv.split('\n')[1]).toBe('9,x,"St. Mary\'s, ""North"""')
  })
})