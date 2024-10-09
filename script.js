async function handleReactFormAutomation() {
  // 点击 "Add Vote" 按钮
  const addVoteButton = document.querySelector('button[aria-label="Add Vote"]');
  if (!addVoteButton) {
    console.error("Add Vote button not found");
    return;
  }
  addVoteButton.click();

  // 等待弹窗出现和输入框加载
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 查找输入框
  const emailInput = document.querySelector('input[id^="field-:"]');
  if (!emailInput) {
    console.error("Email input not found");
    return;
  }

  // 生成随机邮箱
  const randomEmail = generateRandomEmail();
  console.log('Generated email:', randomEmail);

  // 获取 React 实例
  let reactInstance = null;
  for (const key in emailInput) {
    if (key.startsWith('__reactProps$')) {
      reactInstance = emailInput[key];
      break;
    }
  }

  if (!reactInstance) {
    console.error("Could not find React instance");
    return;
  }

  // 提取 React 的 onChange 处理函数
  const onChangeHandler = reactInstance.onChange;

  // 模拟 React 的合成事件
  const createReactSyntheticEvent = (value) => {
    return {
      target: {
        value: value,
        name: emailInput.name,
        type: 'email'
      },
      currentTarget: {
        value: value,
        name: emailInput.name,
        type: 'email'
      },
      preventDefault: () => {},
      stopPropagation: () => {},
      persist: () => {},
      nativeEvent: new InputEvent('input', { bubbles: true })
    };
  };

  // 执行粘贴操作
  async function simulateReactPaste() {
    // 1. 聚焦输入框
    emailInput.focus();
    
    // 2. 创建剪贴板事件数据
    const pasteData = new DataTransfer();
    pasteData.setData('text/plain', randomEmail);
    
    // 3. 创建并分发 React 的 onChange 事件
    if (onChangeHandler) {
      const syntheticEvent = createReactSyntheticEvent(randomEmail);
      onChangeHandler(syntheticEvent);
    }

    // 4. 设置输入框的实际值
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(emailInput, randomEmail);

    // 5. 触发原生事件以确保同步
    ['input', 'change'].forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      emailInput.dispatchEvent(event);
    });

    // 6. 触发 React 的 onBlur 事件
    if (reactInstance.onBlur) {
      const blurEvent = createReactSyntheticEvent(randomEmail);
      reactInstance.onBlur(blurEvent);
    }
  }

  // 执行模拟操作
  await simulateReactPaste();
  
  // 等待 React 状态更新
  await new Promise(resolve => setTimeout(resolve, 100));

  // 验证输入
  console.log('Input value after paste:', emailInput.value);
  console.log('React props value:', reactInstance.value);

  // 等待一下以确保 React 状态已更新
  await new Promise(resolve => setTimeout(resolve, 500));

  // 查找并点击 "Log In" 按钮
  const loginButton = document.querySelector('button.css-ezsa58');
  if (loginButton) {
    // 最后一次检查
    if (emailInput.value === randomEmail) {
      console.log(`Final input value: ${emailInput.value}`);
      loginButton.click();
    } else {
      console.error("Email value mismatch before clicking login");
    }
  } else {
    console.error("Log In button not found");
  }
}

// 第二个脚本的逻辑
const categories = ['Best New', 'Best PUSH', 'Best K-Pop'];

const waitForElement = (selector, timeout = 5000) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(checkInterval);
                resolve(element);
            }
            if (Date.now() - startTime >= timeout) {
                clearInterval(checkInterval);
                reject(new Error('Element not found within timeout'));
            }
        }, 100); // 每100毫秒检查一次
    });
};

const voteForCategory = async (category) => {
    const categoryElement = [...document.querySelectorAll('h2.chakra-heading.css-1xc662w')]
        .find(el => el.textContent.trim() === category);

    if (categoryElement) {
        categoryElement.click();

        // 等待 "LE SSERAFIM" 元素出现
        await waitForElement('h3.chakra-heading.css-1vcxf53');

        const leSserafimElement = [...document.querySelectorAll('h3.chakra-heading.css-1vcxf53')]
            .find(el => el.textContent.trim() === 'LE SSERAFIM');

        if (leSserafimElement) {
            // 获取它的父元素并查找按钮
            const buttonContainer = leSserafimElement.closest('div.css-0');
            const addVoteButton = buttonContainer.querySelector('button[aria-label="Add Vote"]');

            if (addVoteButton) {
                // 点击按钮 10 次
                for (let i = 0; i < 10; i++) {
                    addVoteButton.click();
                    await new Promise(resolve => setTimeout(resolve, 200)); // 每次点击后稍微延迟
                }
            }

            // 检测提交按钮并点击
            const submitButton = await waitForElement('button.chakra-button.css-nlw66z');
            if (submitButton) {
                submitButton.click();
            }
        }
    }

    // 每个类别之间增加延迟
    await new Promise(resolve => setTimeout(resolve, 3000));
};

// 执行自动化流程
(async () => {
  try {
    await handleReactFormAutomation();
    // 使用 async/await 依次处理每个类别
    for (const category of categories) {
        await voteForCategory(category);
    }
  } catch (error) {
    console.error("Automation failed:", error);
  }
})();
