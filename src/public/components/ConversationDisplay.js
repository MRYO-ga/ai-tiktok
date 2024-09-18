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
                        <div key={resultIndex} className="bg-white rounded-lg shadow-md p-6 mb-4">
                            <h3 className="text-xl font-bold mb-4">{result.question}</h3>
                            
                            {result.isLoading ? (
                                <div className="flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <h4 className="font-semibold mb-2">回答：</h4>
                                        <p className="text-gray-700">{result.summary.conclusion}</p>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <h4 className="font-semibold mb-2">综合分析：</h4>
                                        <div 
                                            className="text-gray-700"
                                            dangerouslySetInnerHTML={{
                                                __html: result.summary.analysis 
                                                    ? result.summary.analysis.replace(
                                                        /<important>(.*?)<\/important>/g, 
                                                        '<span class="font-bold text-blue-600">$1</span>'
                                                    )
                                                    : '暂无分析'
                                            }}
                                        />
                                    </div>
                                    
                                    {result.relatedQuestions && result.relatedQuestions.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold mb-2">相关问题：</h4>
                                            <ul className="list-disc pl-5">
                                                {result.relatedQuestions.map((question, index) => (
                                                    <li 
                                                        key={index} 
                                                        className="text-blue-600 cursor-pointer hover:underline"
                                                        onClick={() => handleSearch(question)}
                                                    >
                                                        {question}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {result.isVideoSearch && result.videoData && (
                                        <div className="mt-4">
                                            <h4 className="font-semibold mb-2">相关视频：</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                {result.videoData.map((video, index) => (
                                                    <div key={index} className="border rounded-lg p-2">
                                                        <VideoPlayer url={video.download_url} />
                                                        <p className="mt-2 text-sm">{video.desc}</p>
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