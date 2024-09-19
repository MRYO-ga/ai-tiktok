const React = window.React;
const MarkdownRenderer = window.MarkdownRenderer;

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
                            
                            {result.isLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold mb-3 text-gray-700">回答</h4>
                                        <MarkdownRenderer content={result.summary.conclusion || '暂无回答'} />
                                    </div>
                                    
                                    {result.relatedQuestions && result.relatedQuestions.length > 0 && (
                                        <div className="mb-6">
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
                                    
                                    {result.isVideoSearch && result.videoData && (
                                        <div className="mt-6">
                                            <h4 className="text-xl font-semibold mb-3 text-gray-700">相关视频：</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                {result.videoData.map((video, index) => (
                                                    <div key={index} className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                                        <VideoPlayer url={video.download_url} />
                                                        <p className="mt-2 text-sm text-gray-600">{video.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
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