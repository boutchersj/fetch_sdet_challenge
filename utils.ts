const fs = require('fs')
import type { Page } from 'playwright'

export async function saveHTML(page: Page, fileName: string) {
    const pageSource = await page.content()
    await fs.promises.writeFile(`screenshots/${fileName}.html`, pageSource)
}

export async function savePNG(page: Page, fileName: string) {
    await page.screenshot({ path: `screenshots/${fileName}.png`, fullPage: true });
}