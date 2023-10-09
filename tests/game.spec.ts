import { test, expect, chromium, Browser, BrowserContext, Page, Locator, TestInfo } from '@playwright/test';
import { saveHTML, savePNG } from '../utils.ts'

test.describe('SDET Challenge', async () => {
    let browser: Browser;
    let context: BrowserContext;
    let page: Page;

    let weighingPans: Locator[]
    let group1: number[] = [0,1,2]
    let group2: number[] = [3,4,5]
    let firstResult: string = ''
    let secondResult: string = ''
    let fakeCoin: Locator;

    async function getNthResult(nthResult: number): Promise<string> {
        const result: Locator = page.locator(`ol li:nth-child(${nthResult})`)
        const resultText: string = await result.textContent() as string

        return resultText
    }

    test.beforeAll(async () => {
        browser = await chromium.launch({ headless: false });
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
        await expect(weighingPans).toHaveLength(2)
        await expect(weighingPans[0]).toHaveText('left bowl')
        await expect(weighingPans[1]).toHaveText('right bowl')
    })

    test('Step 1', async () => {
        // Compare gold bars 0-2 and 3-5
        await page.getByTestId('left_0').fill(`${group1[0]}`)
        await page.getByTestId('left_1').fill(`${group1[1]}`)
        await page.getByTestId('left_2').fill(`${group1[2]}`)

        await page.getByTestId('right_0').fill(`${group2[0]}`)
        await page.getByTestId('right_1').fill(`${group2[1]}`)
        await page.getByTestId('right_2').fill(`${group2[2]}`)

        await page.getByTestId('weigh').click()

        firstResult = await getNthResult(1)

        if (firstResult.includes('=')) {
            await expect(firstResult).toEqual('[0,1,2] = [3,4,5]')

            group2 = [6,7,8]
        }

        else if (firstResult.includes('<')) {
            await expect(firstResult).toEqual('[0,1,2] < [3,4,5]')

            group1 = [0]
            group2 = [1]
        }

        else if (firstResult.includes('>')) {
            await expect(firstResult).toEqual('[0,1,2] > [3,4,5]')

            group1 = [3]
            group2 = [4]
        }
    })

    test('Step 2', async () => {
        // If fake gold detected in Step 1, compare 2 of the 3 possible fakes
        if (group1.length == 1 && group2.length == 1) {
            await page.getByTestId('left_0').fill(`${group1[0]}`)
            await page.getByTestId('left_1').fill(``)
            await page.getByTestId('left_2').fill(``)
    
            await page.getByTestId('right_0').fill(`${group2[0]}`)
            await page.getByTestId('right_1').fill(``)
            await page.getByTestId('right_2').fill(``)
    
            await page.getByTestId('weigh').click()
    
            secondResult = await getNthResult(2)
            console.log(secondResult)
    
            if (secondResult.includes('=')) {
                fakeCoin = await page.getByTestId(`coin_${group2[0] + 1}`)
                await fakeCoin.click()
            }
        }

        // If no fake gold detected in Step 1, compare 0-2 to 6-8
        else {

        }
    })

    test('Step 3', async () => {
        // If fake gold detected between 2 suspects, guess the fake gold

        // If fake gold detected in 6-8, compare 6 & 7

    })

    test('Step 4', async () => {
        // If fake gold already guessed, expect a success message

        // If fake gold detected in Step 3, guess the fake gold (6 or 7)

    })
})