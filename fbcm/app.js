const puppeteer = require('puppeteer-core');
const path = require("path");
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        ignoreDefaultArgs: ["--enable-automation"],
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        // defaultViewport: {width: 1000, height: 600, deviceScaleFactor: 1},
        userDataDir: path.resolve("./profile1")
    });

    const page = await browser.newPage();

    page.on('response', async (response) => {
        const matches = response.url().includes("https://captchas.freebitco.in/botdetect/e/live/images/")
        if (matches) {
            console.log(response.url());
            const buffer = await response.buffer();
            fs.writeFileSync(`./1.jpeg`, buffer, 'base64');
        }
    });

    await page.goto('https://freebitco.in');
    // await page.waitForNavigation();

    // await page.waitForSelector("li.login_menu_button");
    // await page.click("li.login_menu_button");

    // await page.waitForSelector('fieldset #login_form_btc_address')
    // await page.type('fieldset #login_form_btc_address', "worm.ori.0201@gmail.com")

    // await page.waitForSelector('fieldset #login_form_password')
    // await page.type('fieldset #login_form_password', "eVKv9Yx7eR7qXtYT")

    // await page.waitForSelector('.row #login_button')
    // await page.click('.row #login_button')



    // #push_notification_modal > div.push_notification_small > div:nth-child(2) > div > div.pushpad_deny_button

    await page.waitForSelector("#free_play_double_captchas", {
        visible: true
    });
    // const hrefElement = await page.$("#free_play_double_captchas");
    // await hrefElement.screenshot({path: 'example.png'});

    // document.querySelectorAll('[class="captchasnet_captcha_content"] img')[0].src
})();