import { test, expect } from '@playwright/test'

test('home page loads', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBeTruthy()
})

test('no sideways scrolling', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
