const puppeteer = require('puppeteer');

async function generateRandomEmail() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const domains = ['gmail.com', 'outlook.com', 'naver.com', 'kakao.com'];
  let username = '';
  for (let i = 0; i < 10; i++) {
    username += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username}@${domain}`;
}

async function handleReactFormAutomation(page) {
  // 点击 "Add Vote" 按钮
  const addVoteButtonSelector = 'button[aria-label="Add Vote"]';
  await page.waitForSelector(addVoteButtonSelector);
  await page.click(addVoteButtonSelector);

  // 等待弹窗出现和输入框加载
  await page.waitForTimeout(1000);

  // 输入随机生成的邮箱
  const emailInputSelector = 'input[id^="field-:"]';
  await page.waitForSelector(emailInputSelector);
  const randomEmail = await generateRandomEmail();
  await page.type(emailInputSelector, randomEmail);

  console.log('Generated email:', randomEmail);

  // 查找并点击 "Log In" 按钮
  const loginButtonSelector = 'button.css-ezsa58';
  await page.waitForSelector(loginButtonSelector);
  await page.click(loginButtonSelector);

  console.log('Logged in with email:', randomEmail);
}

async function voteForCategory(page, category) {
  // 找到分类标题并点击
  const categorySelector = `h2.chakra-heading.css-1xc662w`;
  await page.waitForSelector(categorySelector);
  const categoryElements = await page.$$(categorySelector);

  for (const element of categoryElements) {
    const text = await (await element.getProperty('textContent')).jsonValue();
    if (text.trim() === category) {
      await element.click();
      break;
    }
  }

  // 等待 LE SSERAFIM 元素出现并点击投票按钮
  const leSserafimSelector = 'h3.chakra-heading.css-1vcxf53';
  await page.waitForSelector(leSserafimSelector);
  const leSserafimElements = await page.$$(leSserafimSelector);

  for (const element of leSserafimElements) {
    const text = await (await element.getProperty('textContent')).jsonValue();
    if (text.trim() === 'LE SSERAFIM') {
      const buttonContainer = await element.evaluateHandle(el => el.closest('div.css-0'));
      const addVoteButton = await buttonContainer.$('button[aria-label="Add Vote"]');
      if (addVoteButton) {
        for (let i = 0; i < 10; i++) {
          await addVoteButton.click();
          await page.waitForTimeout(200); // 每次点击后稍微延迟
        }
      }
      break;
    }
  }

  // 提交投票
  const submitButtonSelector = 'button.chakra-button.css-nlw66z';
  await page.waitForSelector(submitButtonSelector);
  await page.click(submitButtonSelector);

  console.log(`Voted for category: ${category}`);
}

async function logOut(page) {
  // 点击 "LOG OUT" 按钮
  const logOutButtonSelector = 'button.chakra-button.AuthNav__login-btn.css-ki1yvo';
  await page.waitForSelector(logOutButtonSelector);
  await page.click(logOutButtonSelector);

  console.log("Logged out successfully.");
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.mtvema.com/vote/');

  const categories = ['Best New', 'Best PUSH', 'Best K-Pop'];

  for (let i = 0; i < 10; i++) { // 执行 10 次自动化
    console.log(`Executing vote round ${i + 1}`);
    await handleReactFormAutomation(page);

    // 为每个类别投票
    for (const category of categories) {
      await voteForCategory(page, category);
      await page.waitForTimeout(3000); // 每个类别之间增加延迟
    }

    await logOut(page);
    await page.waitForTimeout(1000); // 等待页面刷新或重置
  }

  await browser.close();
})();
