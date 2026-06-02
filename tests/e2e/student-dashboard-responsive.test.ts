import { expect, test } from '@playwright/test'

test('student dashboard is usable at desktop and mobile widths', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')

  await expect(page.getByText('Alumos').first()).toBeVisible()
  await expect(page.getByText('Alex Rivers').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Grades' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Messages' })).toBeVisible()
  await expect(page.getByText('AI Coach Insights')).toBeVisible()
  await expect(page.getByText('This Week')).toBeVisible()
  await expect(page.getByLabel(/To-Do/)).toBeVisible()
  await expect(page.getByLabel(/Completed/)).toBeVisible()

  await page.setViewportSize({ width: 390, height: 900 })
  await expect(page.getByText('Alumos').last()).toBeVisible()
  await expect(page.getByText('Alex Rivers').last()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible()
  await expect(page.getByText('This Week')).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(() => (
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  ))
  expect(hasHorizontalOverflow).toBe(false)

  await page.locator('header').getByRole('button', { name: 'Grades' }).click()
  await expect(page.getByRole('heading', { name: 'Grades' })).toBeVisible()

  await page.locator('header').getByRole('button', { name: 'Messages' }).click()
  await expect(page.getByRole('heading', { name: 'Messages are coming soon' })).toBeVisible()
})
