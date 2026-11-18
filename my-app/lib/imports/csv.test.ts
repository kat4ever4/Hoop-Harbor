// @vitest-environment node
import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { readImportRows } from './csv'

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

  it('propagates failure to read the file', async () => {
    await expect(Array.fromAsync(readImportRows('/no-such-import-file.csv', legacyMapping)))
      .rejects.toMatchObject({ code: 'ENOENT' })
  })
})
