const React = window.React;
const { useState, useEffect } = React;
const MarkdownRenderer = window.MarkdownRenderer;
const CollapsibleLoadingStatus = window.CollapsibleLoadingStatus;

const ConversationDisplay = ({ 
    conversations, 
    displaySteps, 
    VideoPlayer, 
    setSelectedEvidence, 
    handleSearch, 
    isLoading 
}) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
            {conversations.map((conversation, conversationIndex) => (
                <div key={conversationIndex} className="mb-8">
                    {conversation.map((result, resultIndex) => (
                        <div key={resultIndex} className="bg-white rounded-lg shadow-md p-6 mb-4 transition-all duration-300 hover:shadow-lg">
                            <h3 className="text-2xl font-bold mb-4 text-blue-600">{result.question}</h3>
                            
                            <CollapsibleLoadingStatus 
                                statuses={result.loadingStatuses || []} 
                                isAllCompleted={!result.isLoading}
                            />
                            
                            {!result.isLoading && (
                                <>
                                    <div className="my-6">
                                        <h4 className="text-xl font-semibold mb-3 text-gray-700">回答</h4>
                                        <AnnotatedChatMessage 
                                            content={result.summary.conclusion || '暂无回答'} 
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
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

// 将组件挂载到全局对象上
window.ConversationDisplay = ConversationDisplay;