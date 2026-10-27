import { test, expect } from '@playwright/test'
import { APP_CONFIG } from '../../lib/app-config'

test('manifest is served with the right name and mode', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest')
  expect(res.ok()).toBeTruthy()
  const manifest = await res.json()
  expect(manifest.name).toBe(APP_CONFIG.name)
  expect(manifest.display).toBe('standalone')
})

test('every icon in the manifest actually exists', async ({ request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json()
  for (const icon of manifest.icons) {
    const res = await request.get(icon.src)
    expect(res.ok(), `${icon.src} should load`).toBeTruthy()
  }
})
