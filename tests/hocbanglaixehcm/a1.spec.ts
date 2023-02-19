import test, { Page } from "@playwright/test";
import * as fs from 'fs';
import { downloadImageToUrl } from "../../src/utils/download.utils";
import { A1Answer, A1Record } from "./a1.type";

test('a1_crawler', async ({ page }) => {
    test.setTimeout(10 * 60 * 1000);
    page.on('dialog', async (dialog) => {
        console.log('On dialog');
        await dialog.accept()
    });

    for (let i = 1; i <= 28; i++) {
        await crawTest(page, `de${i}`);
    }
});

const crawTest = async (page: Page, testId: string) => {
    await page.goto('https://hoclaixehcm.vn/thi-bang-lai-xe-may-a1-online/');
    await page.locator(`//button[@name='chondethi' and @value='${testId}']`).click();

    await page.locator("//input[@id='nopbai']").click();

    const count = await page.locator("//div[contains(@class, 'ndcauhoi')]").count();

    const records: A1Record[] = [];
    for (let i = 1; i <= count; i++) {
        const record: A1Record = {}
        // - Lấy câu hỏi
        record.question = await page.locator(`//*[@id="data${i}"]/div[1]/div[2]/strong`).textContent();
        // - Phân loại có phải câu hỏi liệt không
        let isImportant = false;
        if (record.question?.includes("*")) {
            record.isImportant = true;
        }

        // - Lấy hình
        // -- Nếu là hình chưa có -> down về
        const imageUrl = await page.locator(`//*[@id="data${i}"]/div[1]/img`).getAttribute('src');
        let imageWithPath = '';
        if (imageUrl) {
            imageWithPath = imageUrl.replace('../', '').trim();
            // Check image exist
            // - check folder exist, if not create it
            const fullFilePath = `${__dirname}/${imageWithPath}`;
            if (!fs.existsSync(fullFilePath)) {
                console.log('File does not exist, start download now: ', imageWithPath);
                await downloadImageToUrl(`https://hoclaixehcm.vn/${imageWithPath}`, fullFilePath);
            }
            record.image = imageWithPath;
        }


        // - Lấy câu trả lời
        record.answers = [];
        const answerLocators = await page.locator(`//*[@id="data${i}"]//div[@class='cautraloi']//label`).all();
        for (const answerLocator of answerLocators) {
            const rawAnswer = await answerLocator.innerText();
            const answerParts = rawAnswer.split('- ');

            const checkedValue = await answerLocator.locator('input').getAttribute('checked');

            // - Lấy câu trả lời đúng
            let isCorrect = false;
            if (checkedValue === '') {
                isCorrect = true
            }

            record.answers.push({
                id: parseInt(answerParts[0]),
                content: answerParts[1].replace('.', ''),
                isCorrect: isCorrect,
            });
        }

        // - Lấy giải thích
        record.explain = await page.locator(`//*[@id="data${i}"]/div[2]/div/p`).textContent();
        records.push(record);
    }

    console.log(`${testId}: ${records.length}`)
    fs.writeFileSync(`${__dirname}/records/${testId}.json`, JSON.stringify(records));

    // Ghi ra file json: {"question":"","is_important":"","image":"","answer":[{"id": "", "content"}],"correct_answer":"","explain":""}


    // console.log(question);
}