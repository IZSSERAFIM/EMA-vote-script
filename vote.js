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

// 使用 async/await 依次处理每个类别
(async () => {
    for (const category of categories) {
        await voteForCategory(category);
    }
})();
