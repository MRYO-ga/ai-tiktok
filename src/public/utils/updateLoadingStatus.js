const updateLoadingStatus = (setConversations, status) => {
    setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conversation => {
            if (conversation.length === 0) {
                return [{
                    loadingStatuses: [status],
                    isLoading: true
                }];
            } else {
                return conversation.map(result => ({
                    ...result,
                    loadingStatuses: [...(result.loadingStatuses || []), status],
                    isLoading: true
                }));
            }
        });
        console.log("Updated conversations:", updatedConversations);
        return updatedConversations;
    });
};

// 将函数挂载到window对象上
window.updateLoadingStatus = updateLoadingStatus;