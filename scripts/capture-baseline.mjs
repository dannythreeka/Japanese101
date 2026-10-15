import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
const out = 'docs/verification/evidence/P0/ui'
mkdirSync(out, { recursive: true })
const first = JSON.parse(readFileSync('data/levels.json', 'utf8')).levels[0].level_id
const browser = await chromium.launch()
const context = await browser.newContext({ serviceWorkers: 'block' })
await context.addInitScript(() => { localStorage.setItem('uiLang', 'zh'); localStorage.setItem('micMode', 'offline') })
const page = await context.newPage()
const results = []
try {
  await page.goto('http://127.0.0.1:4173/#/')
  await page.goto('http://127.0.0.1:4173/#/profiles/new')
  await page.locator('#profile-name').fill('QA-P0')
  await page.getByRole('button', { name: '建立！', exact: true }).click()
  await page.getByText('QA-P0', { exact: true }).waitFor()
  const routes = { home: '/', profiles: '/profiles', adventure: '/adventure', unit: `/adventure/level/${first}`, catch: '/play/kana-catch', write: '/play/kana-write', voice: '/play/kotodama', parent: '/parent', sync: '/' }
  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const [name, route] of Object.entries(routes)) {
      await page.goto(`http://127.0.0.1:4173/#${route}`)
      await page.reload()
      if (name === 'sync') await page.getByRole('button', { name: '雲端同步', exact: true }).click()
      if (name === 'parent') for (const digit of ['1','2','3','4']) await page.getByRole('button', { name: digit, exact: true }).click()
      await page.waitForTimeout(250)
      const metrics = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        buttons: [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width).map(e => ({ label: e.getAttribute('aria-label') || e.innerText, width: Math.round(e.getBoundingClientRect().width), height: Math.round(e.getBoundingClientRect().height) })),
        lang: document.documentElement.lang,
        text: document.body.innerText.slice(0, 500),
      }))
      results.push({ name, ...metrics })
      await page.screenshot({ path: `${out}/${name}-${width}.png`, fullPage: true })
    }
  }
  // Enlarge computed text only, keeping viewport and control geometry unchanged.
  await page.setViewportSize({ width: 390, height: 900 })
  for (const [name, route] of Object.entries(routes)) {
    await page.goto(`http://127.0.0.1:4173/#${route}`)
      await page.reload()
    if (name === 'sync') await page.getByRole('button', { name: '雲端同步', exact: true }).click()
    if (name === 'parent') for (const digit of ['1','2','3','4']) await page.getByRole('button', { name: digit, exact: true }).click()
    await page.waitForTimeout(250)
    await page.evaluate(() => {
      const sizes = [...document.querySelectorAll('body, body *')].map(e => [e, parseFloat(getComputedStyle(e).fontSize), parseFloat(getComputedStyle(e).lineHeight)])
      for (const [e, size, line] of sizes) { e.style.fontSize = `${size*2}px`; if (Number.isFinite(line)) e.style.lineHeight = `${line*2}px` }
    })
    results.push({ name, textScale: 2, ...(await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }))) })
    await page.screenshot({ path: `${out}/${name}-text200.png`, fullPage: true })
  }
  await page.goto('http://127.0.0.1:4173/#/')
  await page.keyboard.press('Tab')
  results.push({ name: 'keyboard', focus: await page.evaluate(() => ({ tag: document.activeElement?.tagName, label: document.activeElement?.getAttribute('aria-label'), outline: getComputedStyle(document.activeElement).outline })) })
  await page.screenshot({ path: `${out}/keyboard.png`, fullPage: true })
  writeFileSync(`${out}/metrics.json`, JSON.stringify({ base: '9100671 (runtime src unchanged)', browser: browser.version(), serviceWorkers: 'block', fixture: 'isolated QA-P0; uiLang=zh; micMode=offline; no real mic opened', results }, null, 2)+'\n')
  console.log(`Captured ${results.length} observations; ${browser.version()}`)
} finally { await browser.close() }
