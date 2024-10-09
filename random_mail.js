// 函数：生成随机邮箱
function generateRandomEmail() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const domains = ['rowplant.com', 'linshiyouxiang.net', 'naver.com', 'kakao.com'];

  let username = '';
  for (let i = 0; i < 10; i++) {
    username += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username}@${domain}`;
}

// 点击 "Add Vote" 按钮并处理弹窗
const addVoteButton = document.querySelector('button[aria-label="Add Vote"]');
addVoteButton.click();

// 设置延迟以等待弹窗加载
setTimeout(() => {
  // 生成随机邮箱
  const randomEmail = generateRandomEmail();
  console.log(randomEmail);

  // 填入输入框，找到包含 'field-:' 的 id
  const emailInput = document.querySelector('input[id^="field-:"]');
  if (emailInput) {
    // 模拟人类输入
    let index = 0;

    function typeCharacter() {
      if (index < randomEmail.length) {
        const char = randomEmail.charAt(index);
        emailInput.value += char;
        
        // 创建并触发输入事件
        const event = new Event('input', { bubbles: true });
        emailInput.dispatchEvent(event);

        index++;

        // 获取随机的输入间隔
        const typingSpeed = Math.floor(Math.random() * (300 - 100 + 1)) + 100; // 输入间隔在100到300毫秒之间

        setTimeout(typeCharacter, typingSpeed);
      } else {
        // 输入完成后点击 "Log In" 按钮
        const loginButton = document.querySelector('button.css-ezsa58');
        if (loginButton) {
          loginButton.click();
        } else {
          console.error("Log In button not found");
        }
      }
    }

    typeCharacter(); // 开始输入
  } else {
    console.error("Email input not found");
  }
}, 1000); // 延迟1秒（1000毫秒）
