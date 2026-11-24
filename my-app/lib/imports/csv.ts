import 'server-only'
import { createReadStream } from 'node:fs'
import { Readable } from 'node:stream'
import type { ReadableStream as NodeReadableStream } from 'node:stream/web'
import { parse } from 'csv-parse'
import { inchesToInput } from '@/lib/format-height'
import { EDITABLE_COLUMNS, type RecruitValues } from '@/lib/recruits/fields'
import { parseRecruitForm } from '@/lib/recruits/validate'

export type ColumnMapping = Record<string, string>
export type CsvInput = File | string

const fields = new Set<string>([
  ...EDITABLE_COLUMNS,
  'height', 'notes', 'coach',
  ...[1, 2].flatMap((n) => ['name', 'relationship', 'email', 'phone'].map((f) => `guardian${n}_${f}`)),
].filter((field) => field !== 'guardian_contacts'))

type MappedRow = {
  rowNumber: number
  values: Record<string, string>
  reason?: string
}
export type ImportRow = MappedRow & { recruit?: RecruitValues }

function mapValues(cells: Map<string, string>, mapping: ColumnMapping) {
  const values: Record<string, string> = {}
  for (const [header, field] of Object.entries(mapping)) {
    if (field === 'ignore') continue
    if (!fields.has(field)) throw new Error(`Unknown import field: ${field}`)
    if (Object.hasOwn(values, field)) throw new Error(`Multiple columns map to ${field}.`)
    values[field] = cells.get(header) ?? ''
  }
  return values
}

async function* sheetRecords(input: CsvInput): AsyncGenerator<{ rowNumber: number; cells: string[] }> {
  const source = typeof input === 'string'
    ? createReadStream(input)
    : Readable.fromWeb(input.stream() as NodeReadableStream)
  const parser = parse({ bom: true, trim: true, relax_column_count: true, max_record_size: 64 * 1024 })
  source.on('error', (error: Error) => parser.destroy(error))
  source.pipe(parser)

  let rowNumber = 0
  let foundHeader = false
  let legacy = false
  const worksheet = new Map<string, string>()

  try {
    for await (const cells of parser as AsyncIterable<string[]>) {
      rowNumber++
      if (cells.every((cell) => !cell)) continue
      if (!foundHeader) {
        foundHeader = true
        legacy = cells[0] === 'Recruit Information' && cells.slice(1).every((cell) => !cell)
        if (legacy) continue
      }

      if (!legacy) {
        yield { rowNumber, cells }
        continue
      }

      // The old sheets store one recruit as field labels followed by values.
      if (cells[0] === 'Communication Log') break
      if (cells[0]) worksheet.set(cells[0], cells[1] ?? '')
    }

    if (!foundHeader) throw new Error('The CSV is empty.')
    if (legacy) {
      const name = (worksheet.get('Player Name') ?? '').split(/\s+/).filter(Boolean)
      const last = name.length > 1 ? name.pop()! : ''
      worksheet.set('First Name', name.join(' '))
      worksheet.set('Last Name', last)
      yield { rowNumber: 0, cells: [...worksheet.keys()] }
      yield { rowNumber: 1, cells: [...worksheet.values()] }
    }
  } finally {
    source.destroy()
    parser.destroy()
  }
}

function checkHeaders(headers: string[]) {
  const named = headers.filter(Boolean)
  if (new Set(named).size !== named.length) throw new Error('CSV column headers must be unique.')
  return named
}

export async function getCsvHeaders(input: CsvInput): Promise<string[]> {
  for await (const { cells } of sheetRecords(input)) return checkHeaders(cells)
  throw new Error('The CSV is empty.')
}

async function* readMappedRows(input: CsvInput, mapping: ColumnMapping): AsyncGenerator<MappedRow> {
  let headers: string[] | undefined
  for await (const { rowNumber, cells } of sheetRecords(input)) {
    if (!headers) {
      const named = checkHeaders(cells)
      for (const [header, field] of Object.entries(mapping)) {
        if (field !== 'ignore' && !named.includes(header)) throw new Error(`CSV column not found: ${header}`)
      }
      headers = cells
      continue
    }
    yield {
      rowNumber,
      values: mapValues(new Map(headers.map((header, i) => [header, cells[i] ?? ''])), mapping),
      reason: cells.length === headers.length ? undefined : `Expected ${headers.length} columns, found ${cells.length}.`,
    }
  }
}

/** A File or trusted server-side path. The CSV is read one record at a time. */
export async function* readImportRows(input: CsvInput, mapping: ColumnMapping): AsyncGenerator<ImportRow> {
  for await (const row of readMappedRows(input, mapping)) {
    if (row.reason) {
      yield row
      continue
    }

    const form = new FormData()
    for (const [field, value] of Object.entries(row.values)) {
      if (field === 'positions') {
        for (const position of value.split(/[,/;\s]+/).filter(Boolean)) form.append(field, position.toUpperCase())
      } else if (field === 'height_inches') {
        form.set('height', /^\d{2}$/.test(value) ? inchesToInput(Number(value)) : value)
      } else {
        form.set(field, value)
      }
    }

    const { values: recruit, errors } = parseRecruitForm(form)
    const birthday = recruit.birthday
    if (birthday && !errors.birthday) {
      const date = new Date(birthday)
      if (birthday.startsWith('0000') || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== birthday)
        errors.birthday = 'Enter a valid date.'
    }
    if (form.getAll('positions').length !== recruit.positions.length)
      errors.positions = 'Use PG, SG, SF, PF or C for positions.'
    if (recruit.first_name.length > 100 || recruit.last_name.length > 100 || (recruit.preferred_name?.length ?? 0) > 100)
      errors.name = 'Names must be 100 characters or fewer.'

    const reason = Object.values(errors).join(' ')
    yield reason ? { ...row, reason } : { ...row, recruit }
  }
}
