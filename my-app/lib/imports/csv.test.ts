// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { getCsvHeaders, readImportRows } from './csv'

vi.mock('server-only', () => ({}))

const legacyMapping = {
  'First Name': 'first_name',
  'Last Name': 'last_name',
  'Graduation Year': 'graduation_year',
  'High School': 'high_school',
  'AAU Team': 'club_team',
  Height: 'height_inches',
}

describe('readImportRows', () => {
  it('reads each legacy worksheet as one recruit', async () => {
    const directory = resolve('../fake_csv_files')
    const files = (await readdir(directory)).filter((name) => name.endsWith('.csv')).sort()
    expect(files).toHaveLength(3)

    for (const [index, file] of files.entries()) {
      const rows = await Array.fromAsync(readImportRows(resolve(directory, file), legacyMapping))
      expect(rows).toEqual([expect.objectContaining({
        rowNumber: 1,
        recruit: expect.objectContaining({
          first_name: 'Recruit',
          last_name: String(index + 1),
          graduation_year: 2028,
          height_inches: [70, 76, null][index],
        }),
      })])
    }
  })

  it('exposes mappable headers from standard and legacy File uploads', async () => {
    const standard = new File(['First Name,"School, Club",Grad Year\n'], 'standard.csv')
    expect(await getCsvHeaders(standard)).toEqual(['First Name', 'School, Club', 'Grad Year'])

    const directory = resolve('../fake_csv_files')
    const name = (await readdir(directory)).find((file) => file.endsWith('Recruit 1.csv'))!
    const file = new File([Uint8Array.from(await readFile(resolve(directory, name)))], name)
    expect(await getCsvHeaders(file)).toEqual(expect.arrayContaining(Object.keys(legacyMapping)))
    const [row] = await Array.fromAsync(readImportRows(file, legacyMapping))
    expect(row.recruit).toMatchObject({ first_name: 'Recruit', last_name: '1' })
  })

  it('propagates failure to read the file', async () => {
    await expect(Array.fromAsync(readImportRows('/no-such-import-file.csv', legacyMapping)))
      .rejects.toMatchObject({ code: 'ENOENT' })
  })
})
