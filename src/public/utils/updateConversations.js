
const updateConversations = (setConversations, updater) => {
    setConversations(prevConversations => {
        const updatedConversations = [...prevConversations];
        const currentConversation = updatedConversations[updatedConversations.length - 1] || [];
        const lastResult = currentConversation[currentConversation.length - 1] || {};
        const updatedResult = updater(lastResult);
        if (currentConversation.length === 0) {
            currentConversation.push(updatedResult);
        } else {
            currentConversation[currentConversation.length - 1] = updatedResult;
        }
        return updatedConversations;
    });
};

// 将函数挂载到window对象上
window.updateConversations = updateConversations;