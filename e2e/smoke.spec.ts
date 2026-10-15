import { test, expect } from '@playwright/test'
import { writeFileSync } from 'node:fs'

test('home, profile creation, adventure and PIN entry work in an isolated context', async ({ page, browser }, info) => {
  writeFileSync(info.outputPath('environment.json'), JSON.stringify({ node: process.version, browser: browser.version(), project: info.project.name }, null, 2))
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/#/')
  await expect(page.getByRole('button', { name: /ぼうけんを|冒險/ })).toBeVisible()
  await page.screenshot({ path: info.outputPath('home.png'), fullPage: true })
  await page.goto('/#/profiles/new')
  await page.locator('#profile-name').fill('QA-P0')
  await page.locator('button').last().click()
  await expect(page).toHaveURL(/#\/$/)
  await expect(page.getByText('QA-P0', { exact: true })).toBeVisible()
  await page.goto('/#/adventure')
  await expect(page.locator('body')).toContainText(/冒険|ぼうけん|冒險/)
  await page.goto('/#/parent')
  for (const digit of ['1', '2', '3', '4']) {
    await page.getByRole('button', { name: digit, exact: true }).click()
  }
  await expect(page.getByRole('button', { name: '1', exact: true })).toHaveCount(0)
  await expect(page.locator('body')).toContainText(/設定|せってい|學習|学習/)
  expect(errors).toEqual([])
})
