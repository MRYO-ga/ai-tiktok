const updateLoadingStatus = (setConversations, status) => {
    setConversations(prevConversations => {
        const updatedConversations = [...prevConversations];
        const currentConversation = updatedConversations[updatedConversations.length - 1];
        if (currentConversation) {
            currentConversation.loadingStatuses = [...(currentConversation.loadingStatuses || []), status];
        }
        return updatedConversations;
    });
};

// 将函数挂载到window对象上
window.updateLoadingStatus = updateLoadingStatus;