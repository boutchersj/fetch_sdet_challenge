const fs = require('fs')
import type { Page, Locator } from 'playwright'

export async function saveHTML(page: Page, fileName: string) {
    const pageSource = await page.content()
    await fs.promises.writeFile(`screenshots/${fileName}.html`, pageSource)
}

export async function savePNG(page: Page, fileName: string) {
    await page.screenshot({ path: `screenshots/${fileName}.png`, fullPage: true });
}

export async function getNthResult(page: Page, nthResult: number): Promise<string> {
    const result: Locator = page.locator(`ol li:nth-child(${nthResult})`)
    const resultText: string = await result.textContent() as string

    return resultText
}

export async function clearBoards(page: Page) {
    await page.getByTestId('left_0').fill('')
    await page.getByTestId('left_1').fill('')
    await page.getByTestId('left_2').fill('')

    await page.getByTestId('right_0').fill('')
    await page.getByTestId('right_1').fill('')
    await page.getByTestId('right_2').fill('')
}