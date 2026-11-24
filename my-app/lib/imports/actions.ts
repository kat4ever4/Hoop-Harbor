'use server'

import { revalidatePath } from 'next/cache'
import type { ColumnMapping } from './csv'
import * as imports from './server'
import type { DuplicateChoices } from './server'

function checkFile(file: File) {
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.csv'))
    throw new Error('Please upload a CSV file.')
  if (file.size > 3 * 1024 * 1024) throw new Error('CSV files must be 3 MB or smaller.')
}

export async function getHeaders(file: File) {
  checkFile(file)
  return imports.getHeaders(file)
}

export async function previewImport(file: File, mapping: ColumnMapping) {
  checkFile(file)
  return imports.previewImport(file, mapping)
}

export async function commitImport(file: File, mapping: ColumnMapping, sheetName: string, choices?: DuplicateChoices) {
  checkFile(file)
  const result = await imports.commitImport(file, mapping, sheetName, choices)
  revalidatePath('/recruits', 'layout')
  return result
}

export async function undoImport(batchId: string) {
  const result = await imports.undoImport(batchId)
  revalidatePath('/recruits', 'layout')
  return result
}
