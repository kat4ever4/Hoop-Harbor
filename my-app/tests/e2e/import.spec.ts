import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

// F5 import wizard, end to end. Uses the fake backend, so no database is needed.
const SAMPLE = path.join(__dirname, '..', 'fixtures', 'recruits-sample.csv')

// exact: true, or this also matches Next.js's "Open Next.js Dev Tools" button in dev mode.
const nextButton = (page: Page) => page.getByRole('button', { name: 'Next', exact: true })

test('imports the sample sheet: upload → map → preview → commit → summary', async ({ page }) => {
  await page.goto('/imports/sheets')

  // Upload
  await page.locator('#csv-file').setInputFiles(SAMPLE)
  await expect(page.getByText('5 columns found')).toBeVisible()
  await nextButton(page).click()

  // Map: guesses are already right, so Next is on
  await expect(page.getByLabel('Grad Year')).toHaveValue('graduation_year')
  await nextButton(page).click()

  // Preview: 2 new, 1 duplicate (Reese), 1 error (Taylor)
  await expect(page.getByText('Graduation year must be 4 digits')).toBeVisible()
  await expect(page.getByText('Possible duplicate', { exact: true })).toBeVisible()
  await nextButton(page).click()

  // Commit: duplicate left on skip → 2 recruits
  await page.getByRole('button', { name: 'Import 2 recruits' }).click()

  // Summary
  await expect(page.getByText(/Import complete\. 2 recruits added/)).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: /download skipped rows/i }).click()
  expect((await download).suggestedFilename()).toBe('skipped-rows-recruits-sample.csv')
})

test('rejects a file that is not a CSV', async ({ page }) => {
  await page.goto('/imports/sheets')
  await page.locator('#csv-file').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') })
  // Look for the text, not role="alert": Next.js adds its own hidden alert box.
  await expect(page.getByText(/Please upload a CSV file/)).toBeVisible()
  await expect(nextButton(page)).toBeDisabled()
})

test('Next stays off until required fields are mapped', async ({ page }) => {
  await page.goto('/imports/sheets')
  await page.locator('#csv-file').setInputFiles(SAMPLE)
  await expect(page.getByText('5 columns found')).toBeVisible()
  await nextButton(page).click()
  await page.getByLabel('Last Name').selectOption('ignore')
  await expect(page.getByText('Still needed: Last name.')).toBeVisible()
  await expect(nextButton(page)).toBeDisabled()
})