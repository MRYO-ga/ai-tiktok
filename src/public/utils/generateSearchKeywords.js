const generateSearchKeywords = (userQuestion, userChoices) => {
    if (!userChoices || userChoices.length === 0) {
        return [userQuestion]; // 如果没有用户选择,只返回原始问题
    }

    const baseKeywords = [userQuestion];
    const choiceKeywords = userChoices.flatMap(choice => choice.choices).filter(Boolean);

    // 生成不同组合的搜索关键词
    const combinations = [
        ...baseKeywords,
        ...choiceKeywords.map(keyword => `${userQuestion} ${keyword}`),
        `${userQuestion} ${choiceKeywords.join(' ')}` // Changed from join(' ') to join(' ')
    ];

    // 去重并返回
    return [...new Set(combinations)];
};

// 将函数挂载到window对象上
window.generateSearchKeywords = generateSearchKeywords;