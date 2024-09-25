const React = window.React;
const { useState, useEffect, useRef } = React;
const MarkdownRenderer = window.MarkdownRenderer;
const CollapsibleLoadingStatus = window.CollapsibleLoadingStatus;

// 添加 LoadingIndicator 组件的定义
const LoadingIndicator = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

// 添加一个格式化数字的函数
const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

const ConversationDisplay = ({ 
    conversations, 
    displaySteps, 
    VideoPlayer, 
    setSelectedEvidence, 
    handleSearch, 
    isLoading, 
    waitingForUserChoices,
    setConversations  // 添加这个prop
}) => {
    const resultsContainerRef = useRef(null);
    const videoScrollRef = useRef(null);

    // useEffect(() => {
    //     console.log("waitingForUserChoices changed:", waitingForUserChoices);
    //     console.log("conversations:", conversations);
    // }, [waitingForUserChoices, conversations]);

    const scrollVideos = (direction) => {
        if (videoScrollRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            videoScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const renderConversation = (conversation, conversationIndex) => {
        return conversation.map((result, index) => (
                <div key={index} className="mb-8 border-b pb-4">
                    <h3 className="text-2xl font-bold mb-4 text-blue-600">{result.question}</h3>
                    
                    <CollapsibleLoadingStatus 
                        statuses={result.loadingStatuses || []} 
                        isAllCompleted={!result.isLoading}
                        fullIntent={result.fullIntent}
                        onSubIntentChange={(subIntent, selectedOption) => handleSubIntentChange(result, subIntent, selectedOption)}
                        onRegenerateAnswer={(allOptions) => handleRegenerateAnswer(result, allOptions)}
                    />
                    
                    {result.searchResults && result.searchResults.length > 0 && (
                        <div className="mt-4 relative">
                            <h4 className="text-lg font-semibold mb-2">相关视频</h4>
                            <div className="flex items-center">
                                <button onClick={() => scrollVideos('left')} className="absolute left-0 z-10 bg-white bg-opacity-50 p-2 rounded-full">
                                    ◀
                                </button>
                                <div ref={videoScrollRef} className="flex overflow-x-auto scrollbar-hide space-x-4 py-2" style={{scrollBehavior: 'smooth'}}>
                                    {result.searchResults.map((video, videoIndex) => (
                                        <div key={videoIndex} className="flex-shrink-0 w-48 bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                                             onClick={() => window.open(video.share_url, '_blank')}>
                                            <img 
                                                src={video.origin_cover || video.dynamic_cover || 'path/to/fallback/image.jpg'}  
                                                alt={video.title} 
                                                className="w-full h-32 object-cover" 
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = 'path/to/fallback/image.jpg'
                                                }}
                                            />
                                            <div className="p-2">
                                                <h5 className="font-semibold text-sm truncate">{video.title}</h5>
                                                <p className="text-xs text-gray-600 truncate">作者: {video.author}</p>
                                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                    <span title={`${video.likes} 赞`}>👍 {formatNumber(video.likes)}</span>
                                                    <span title={`${video.comments} 评论`}>💬 {formatNumber(video.comments)}</span>
                                                    <span title={`${video.shares} 分享`}>🔗 {formatNumber(video.shares)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => scrollVideos('right')} className="absolute right-0 z-10 bg-white bg-opacity-50 p-2 rounded-full">
                                    ▶
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="my-6">
                        <h4 className="text-xl font-semibold mb-3 text-gray-700">回答</h4>
                        <AnnotatedChatMessage 
                            content={(result.summary && result.summary.conclusion) || '暂无回答'} 
                            videoData={result.videoData}
                        />
                    </div>
                    
                    {result.relatedQuestions && result.relatedQuestions.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-xl font-semibold mb-3 text-gray-700">相关问题：</h4>
                            <ul className="list-disc pl-5 space-y-2">
                                {result.relatedQuestions.map((question, index) => (
                                    <li 
                                        key={index} 
                                        className="text-blue-600 cursor-pointer hover:underline transition-colors duration-200"
                                        onClick={() => handleSearch(question)}
                                    >
                                        {question}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                </div>
        ));
    };

    const handleSubIntentChange = (result, subIntent, selectedOption) => {
        const updatedConversations = conversations.map(conversation => 
            conversation.map(r => 
                r === result 
                    ? {
                        ...r, 
                        fullIntent: {
                            ...r.fullIntent,
                            subIntents: r.fullIntent.subIntents.map(si => 
                                si.intent === subIntent.intent 
                                    ? {
                                        ...si, 
                                        selectedOptions: si.selectedOptions 
                                            ? si.selectedOptions.includes(selectedOption)
                                                ? si.selectedOptions.filter(option => option !== selectedOption)
                                                : [...si.selectedOptions, selectedOption]
                                            : [selectedOption]
                                    } 
                                    : si
                        )
                    }
                } 
                : r
            )
        );
        setConversations(updatedConversations);
    };

    const handleRegenerateAnswer = (result, allOptions) => {
        console.log("重新生成答案，所有选项:", allOptions);
        
        const userChoices = allOptions.map(option => ({
            intent: option.intent,
            choices: option.selectedOptions
        }));
        
        if (waitingForUserChoices) {
            waitingForUserChoices(userChoices);
        }
        // 触发新的搜索
        handleSearch(result.question, false, result.isVideoSearch, userChoices);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4" ref={resultsContainerRef}>
            {conversations.map((conversation, index) => (
                <div key={index} className="mb-8">
                    {renderConversation(conversation, index)}
                </div>
            ))}
            {isLoading && <LoadingIndicator />}
            {/* 删除调试信息 UI */}
        </div>
    );
};

// 将组件挂载到全局对象上
window.ConversationDisplay = ConversationDisplay;