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

// 执行自动化流程
try {
  await handleReactFormAutomation();
} catch (error) {
  console.error("Automation failed:", error);
}
