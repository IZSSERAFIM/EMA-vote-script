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
  try {
    // 点击 "Add Vote" 按钮
    await page.waitForSelector('button[aria-label="Add Vote"]');
    await page.click('button[aria-label="Add Vote"]');

    // 等待弹窗出现
    await page.waitForTimeout(1000);

    // 生成随机邮箱并输入
    const randomEmail = await generateRandomEmail();
    console.log('Generated email:', randomEmail);

    // 输入邮箱地址
    await page.evaluate((email) => {
      const emailInput = document.querySelector('input[id^="field-:"]');
      if (emailInput) {
        emailInput.value = email;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, randomEmail);

    // 点击 "Log In" 按钮
    await page.waitForSelector('button.css-ezsa58');
    await page.click('button.css-ezsa58');
  } catch (error) {
    console.error("Error in handleReactFormAutomation:", error);
  }
}

async function voteForCategory(page, category) {
  try {
    await page.waitForSelector('h2.chakra-heading.css-1xc662w');
    const categoryElement = await page.evaluateHandle((category) => {
      return [...document.querySelectorAll('h2.chakra-heading.css-1xc662w')]
        .find(el => el.textContent.trim() === category);
    }, category);

    if (categoryElement) {
      await categoryElement.click();

      // 等待 "LE SSERAFIM" 出现
      await page.waitForSelector('h3.chakra-heading.css-1vcxf53');
      const leSserafimElement = await page.evaluateHandle(() => {
        return [...document.querySelectorAll('h3.chakra-heading.css-1vcxf53')]
          .find(el => el.textContent.trim() === 'LE SSERAFIM');
      });

      if (leSserafimElement) {
        const addVoteButton = await leSserafimElement.evaluateHandle(el => {
          return el.closest('div.css-0').querySelector('button[aria-label="Add Vote"]');
        });

        if (addVoteButton) {
          for (let i = 0; i < 10; i++) {
            await addVoteButton.click();
            await page.waitForTimeout(200);
          }
        }

        // 提交投票
        await page.waitForSelector('button.chakra-button.css-nlw66z');
        await page.click('button.chakra-button.css-nlw66z');
      }
    }
  } catch (error) {
    console.error(`Error voting for category "${category}":`, error);
  }
}

async function logOut(page) {
  try {
    await page.waitForSelector('button.chakra-button.AuthNav__login-btn.css-ki1yvo');
    await page.click('button.chakra-button.AuthNav__login-btn.css-ki1yvo');
    console.log("Logged out successfully.");
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.mtvema.com/vote/', { waitUntil: 'networkidle2' });

    const categories = ['Best New', 'Best PUSH', 'Best K-Pop'];
    for (let i = 0; i < 10; i++) {
      console.log(`Executing round ${i + 1}`);

      await handleReactFormAutomation(page);
      for (const category of categories) {
        await voteForCategory(page, category);
      }
      await logOut(page);
    }
  } catch (error) {
    console.error("Automation failed:", error);
  } finally {
    await browser.close();
  }
})();
