const ConversationDisplay = ({ conversations, displaySteps, VideoPlayer, setSelectedEvidence, handleSearch, isLoading }) => {
    return (
        <div className="flex-1 overflow-y-auto p-4">
            {conversations.map((conversation, conversationIndex) => (
                <div key={conversationIndex} className="mb-8">
                    {conversation.map((result, resultIndex) => (
                        <div key={resultIndex} className="mb-4 p-4 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-2">{result.question}</h3>
                            {result.isLoading ? (
                                <p>加载中...</p>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <h4 className="font-semibold">回答：</h4>
                                        <p>{result.summary.conclusion}</p>
                                    </div>
                                    
                                    {result.summary.evidence && result.summary.evidence.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold">证据：</h4>
                                            <ul className="list-disc pl-5">
                                                {result.summary.evidence.map((item, index) => (
                                                    <li key={index} className="mb-2">
                                                        <p>{item.text}</p>
                                                        <p className="text-sm text-gray-500">
                                                            来源: <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item.source}</a>
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {result.relatedComments && result.relatedComments.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold">相关评论：</h4>
                                            <ul className="list-disc pl-5">
                                                {result.relatedComments.map((comment, index) => (
                                                    <li key={index}>{comment}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {result.relatedQuestions && result.relatedQuestions.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold">相关问题：</h4>
                                            <ul className="list-disc pl-5">
                                                {result.relatedQuestions.map((question, index) => (
                                                    <li key={index} className="cursor-pointer text-blue-500 hover:underline" onClick={() => handleSearch(question)}>
                                                        {question}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {result.videoData && (
                                        <VideoPlayer videoData={result.videoData} />
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

window.ConversationDisplay = ConversationDisplay;