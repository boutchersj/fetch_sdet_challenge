import { test, expect, chromium, Browser, BrowserContext, Page, Locator, TestInfo } from '@playwright/test';
import { saveHTML, savePNG, getNthResult, clearBoards } from '../utils'

test.describe('SDET Challenge', async () => {
    let browser: Browser;
    let context: BrowserContext;
    let page: Page;

    let weighingPans: Locator[]
    let goldCoins: number[] = [0,1,2,3,4,5,6,7,8]
    let fakeCoin: Locator;

    test.beforeAll(async () => {
        // For Debugging Only
        // browser = await chromium.launch({ headless: false });
        browser = await chromium.launch();
        context = await browser.newContext();
        page = await context.newPage();
    })

    test.afterEach(async ({page}, testInfo: TestInfo) => {
        await saveHTML(page, testInfo.title)
        await savePNG(page, testInfo.title)
    })

    test.afterAll(async () => {
        await page.close()
        await context.close()
        await browser.close();
    })

    test('SDET Challenge Site is Loaded', async () => {
        await page.goto('http://sdetchallenge.fetch.com/')
        expect(await page.title()).toEqual('React App')

        weighingPans = await page.locator('.game-board').all()
        expect(weighingPans).toHaveLength(2)
        await expect(weighingPans[0]).toHaveText('left bowl')
        await expect(weighingPans[1]).toHaveText('right bowl')
    })

    test('Step 1 - Determine which group of 3', async () => {
        // Compare gold bars 0-2 and 3-5
        await page.getByTestId('left_0').fill(`${goldCoins[0]}`)
        await page.getByTestId('left_1').fill(`${goldCoins[1]}`)
        await page.getByTestId('left_2').fill(`${goldCoins[2]}`)

        await page.getByTestId('right_0').fill(`${goldCoins[3]}`)
        await page.getByTestId('right_1').fill(`${goldCoins[4]}`)
        await page.getByTestId('right_2').fill(`${goldCoins[5]}`)

        await page.getByTestId('weigh').click()

        const firstResult = await getNthResult(page, 1)

        if (firstResult.includes('=')) {
            expect(firstResult).toEqual('[0,1,2] = [3,4,5]')

            goldCoins = goldCoins.slice(6)
        }

        else if (firstResult.includes('<')) {
            expect(firstResult).toEqual('[0,1,2] < [3,4,5]')

            goldCoins = goldCoins.slice(0,3)
        }

        else if (firstResult.includes('>')) {
            expect(firstResult).toEqual('[0,1,2] > [3,4,5]')

            goldCoins = goldCoins.slice(3,6)
        }
    })

    test('Step 2 - Eliminate 2 of 3 possible suspects', async () => {
        await clearBoards(page)

        await page.getByTestId('left_0').fill(`${goldCoins[0]}`)
        await page.getByTestId('right_0').fill(`${goldCoins[1]}`)

        await page.getByTestId('weigh').click()

        const secondResult = await getNthResult(page, 2)

        if (secondResult.includes('=')) {
            fakeCoin = page.getByTestId(`coin_${goldCoins[2]}`)
        }

        else if (secondResult.includes('<')) {
            fakeCoin = page.getByTestId(`coin_${goldCoins[0]}`)
        }

        else if (secondResult.includes('>')) {
            fakeCoin = page.getByTestId(`coin_${goldCoins[1]}`)
        }
    })

    test('Step 3 - Guess the fake coin', async () => {
        page.on('dialog', async (dialog) => {
            expect(dialog.message()).toEqual('Yay! You find it!')
            await dialog.accept()
        });

        await fakeCoin.click()
    })
})