import { chromium, expect } from '@playwright/test'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

// Runs against an already-started isolated review server; never a real child's context.
const origin = process.env.P2_REVIEW_URL ?? 'http://127.0.0.1:4202'
const pack = JSON.parse(await readFile(new URL('../src/content/packs/u01.json', import.meta.url), 'utf8'))
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const browser = await chromium.launch()
const results = []
try {
  for (const [width, height] of [[320, 900], [768, 1024], [1024, 768]]) {
    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()
    const output = `test-results/p2-keyboard-200/${width}`
    await mkdir(output, { recursive: true })
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
    const errors = []; page.on('pageerror', error => errors.push(error.message))
    let keyActivations = 0
    async function zoom() {
      await page.evaluate(() => {
        const original = window.__p2FontOriginal ??= new WeakMap()
        const elements = [...document.querySelectorAll('main, main *, dialog, dialog *')]
        for (const el of elements) {
          if (!original.has(el)) original.set(el, [el.style.fontSize, el.style.lineHeight])
          const [size, line] = original.get(el); el.style.fontSize = size; el.style.lineHeight = line
        }
        const values = elements.map(el => ({ el, size: parseFloat(getComputedStyle(el).fontSize), line: parseFloat(getComputedStyle(el).lineHeight) }))
        for (const { el, size, line } of values) { el.style.fontSize = size * 2 + 'px'; if (Number.isFinite(line)) el.style.lineHeight = line * 2 + 'px' }
      })
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    }
    async function tabTo(target) {
      await expect(target).toBeVisible(); await expect(target).toBeEnabled(); await zoom()
      for (let n = 0; n < 160; n++) {
        if (await target.evaluate(el => el === document.activeElement)) return
        await page.keyboard.press('Tab')
      }
      throw new Error('Keyboard could not reach ' + await target.textContent())
    }
    async function activate(target) { await tabTo(target); await page.keyboard.press('Enter'); keyActivations++ }
    const button = name => page.getByRole('button', { name, exact: true })
    async function place(name) { await activate(button('地點清單')); await activate(page.getByRole('dialog').getByRole('button', { name, exact: true })) }
    async function records(store) {
      return page.evaluate(store => new Promise((resolve, reject) => {
        const request = indexedDB.open('Japanese101DB')
        request.onsuccess = () => { const db = request.result, tx = db.transaction(store), read = tx.objectStore(store).getAll(); read.onsuccess = () => resolve(read.result); tx.onerror = () => reject(tx.error); tx.oncomplete = () => db.close() }
      }), store)
    }
    try {
      await page.goto(origin + '/#/preview/adventure'); await activate(button('略過，先探索'))
      await expect(page.getByRole('dialog', { name: '歡迎來到青葉町', exact: true })).not.toBeVisible()
      const region = page.getByRole('region', { name: '小鎮探索', exact: true })
      await tabTo(region); await page.keyboard.down('ArrowRight'); await expect(page.getByTestId('world-player')).not.toHaveAttribute('data-x', '8'); await page.keyboard.up('ArrowRight')
      await place('初芽道館'); await activate(button('認識新內容'))
      for (let i = 0; i < pack.teaching.length; i++) {
        if (i) await activate(page.getByRole('navigation', { name: '認識新內容', exact: true }).getByRole('button', { name: String(i + 1), exact: true }))
        await activate(button('讀過了，記在手帳')); await expect(button('已保存')).toBeVisible()
      }
      await activate(button('返回').first()); await activate(button('練習對戰'))
      for (let i = 0; i < 4; i++) {
        await activate(button('普通攻擊')); const battle = (await records('battleSessions')).find(b => b.phase === 'question'); const q = pack.questions.find(q => q.id === battle.currentQuestionId)
        await activate(button(q.choices.find(c => c.id === q.answer[0]).text)); await activate(button('確認答案')); await expect(page.getByRole('heading', { name: '答對了，一起記住這個重點。', exact: true })).toBeVisible(); await activate(button('繼續'))
      }
      await activate(button('保存獎勵並回到小鎮')); await expect(page).toHaveURL(/#\/preview\/adventure$/)
      expect((await records('coinWallets'))[0].balance).toBe(60)
      await place('小路裝備店'); const hat = page.locator('article').filter({ has: page.getByRole('heading', { name: '旅行帽', exact: true }) })
      await activate(hat.getByRole('button', { name: '試穿看看', exact: true })); expect(await records('inventory')).toHaveLength(0)
      await activate(hat.getByRole('button', { name: '購買並裝備', exact: true })); await expect(hat.getByText('已裝備', { exact: true })).toBeVisible()
      await activate(button('回到小鎮')); await activate(button('背包')); await activate(button('卸下')); await activate(button('裝備')); await expect(hat.getByText('已裝備', { exact: true })).toBeVisible()
      await page.reload(); await expect(hat.getByText('已裝備', { exact: true })).toBeVisible(); expect((await records('coinWallets'))[0].balance).toBe(20); expect(await records('learningAttempts')).toHaveLength(4)
      await zoom(); await page.screenshot({ path: `docs/phases/P2/evidence/final-visual/keyboard-shop-text200-${width}.png`, fullPage: true })
      await activate(button('回到小鎮')); await activate(button('家長區')); for (const d of '1234') await activate(button(d))
      await expect(page.getByRole('heading', { name: '學習摘要', exact: true })).toBeVisible(); await zoom()
      await expect(page.getByText('首次獨立答對率：100% · 作答樣本 4', { exact: true })).toBeVisible(); expect(errors).toEqual([])
      results.push({ width, height, result: 'PASS', keyActivations, actualAttempts: 4, finalCoins: 20 })
      console.log('KEYBOARD_200_PASS', width, keyActivations, 'native Enter activations reached by Tab')
    } catch (error) { await page.screenshot({ path: output + '/failed.png', fullPage: true }); throw error }
    finally { await context.tracing.stop({ path: output + '/trace.zip' }); await context.close() }
  }
} finally {
  await browser.close()
  await writeFile('docs/phases/P2/evidence/keyboard-200.json', JSON.stringify({ date: new Date().toISOString(), sourceCommit, browser: browser.version(), method: 'Actual Tab focus traversal and native Enter/arrow keys; 200% computed font/line-height restored/reapplied at every screen; desktop viewport simulation, not physical tablet or native device text scaling', fixture: 'fresh isolated context at each width; actual 4 correct UI answers and60coin win,40coin hat; no real child data', results, expected: 3, result: results.length === 3 ? 'PASS' : 'FAIL', traces: 'test-results/p2-keyboard-200/{320,768,1024}/trace.zip', human: 'NOT_RUN' }, null, 2) + '\n')
}
