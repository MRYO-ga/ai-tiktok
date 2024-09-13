const ConversationDisplay = ({ conversations, displaySteps, VideoPlayer, setSelectedEvidence, handleSearch, isLoading }) => (
    <div className="flex-1 overflow-auto space-y-4 p-4">
        {conversations.map((conversation, convIndex) => (
            <div key={convIndex} className="bg-white p-6 rounded-lg shadow space-y-6 animate-slide-up">
                {conversation.map((result, index) => {
                    const stepKey = `${convIndex}-${index}`;
                    const steps = displaySteps[stepKey] || { question: true, websites: true, summary: true, relatedQuestions: true };
                    return (
                        <div key={index} className="bg-white p-6 rounded-lg shadow space-y-4">
                            {result.isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            ) : (
                                <React.Fragment>
                                    {steps.question && (
                                        <div className={`${index === conversation.length - 1 ? "animate-slide-up" : ""} ${index !== 0 ? "mt-4" : ""}`}>
                                            <h3 className="text-xl font-semibold mb-2">提问：</h3>
                                            <p className="text-gray-700 text-lg">{result.question}</p>
                                        </div>
                                    )}
                                    {result.isVideoSearch && result.videoFile && (
                                        <div className="mt-4">
                                            <h3 className="text-xl font-semibold mb-2">上传的视频：</h3>
                                            <VideoPlayer videoFile={result.videoFile} />
                                        </div>
                                    )}
                                    {!result.isVideoSearch && steps.websites && result.searchedWebsites && result.searchedWebsites.length > 0 && (
                                        <div className={`${index === conversation.length - 1 ? "animate-slide-up" : ""} ${index !== 0 ? "mt-4" : ""}`}>
                                            <h3 className="text-xl font-semibold mb-2">已搜索的网站：</h3>
                                            <ul className="list-disc list-inside text-blue-500 text-lg">
                                                {result.searchedWebsites.map((site, siteIndex) => (
                                                    <li key={siteIndex} className={`${index === conversation.length - 1 ? "animate-slide-up" : ""} ${siteIndex !== 0 ? "mt-2" : ""}`} style={{animationDelay: `${siteIndex * 300}ms`}}>
                                                        <a href={site} target="_blank" rel="noopener noreferrer">{site}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {steps.summary && (
                                        <div className={`${index === conversation.length - 1 ? "animate-slide-up" : ""} ${index !== 0 ? "mt-4" : ""}`}>
                                            <h3 className="text-xl font-semibold mb-2">总结：</h3>
                                            <div className="text-gray-700 mb-2 text-lg">
                                                <strong>结论：</strong> 
                                                <span dangerouslySetInnerHTML={{ __html: result.summary.conclusion.replace(/\n/g, '<br>') }} />
                                            </div>
                                            {!result.isVideoSearch && result.summary.evidence && result.summary.evidence.length > 0 && (
                                                <div>
                                                    <p className="text-gray-700 text-lg"><strong>依据：</strong></p>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {result.summary.evidence.map((item, evidenceIndex) => (
                                                            <div key={evidenceIndex} className={`mb-2 text-lg ${index === conversation.length - 1 ? "animate-slide-up" : ""}`} style={{animationDelay: `${evidenceIndex * 300}ms`}}>
                                                                <span dangerouslySetInnerHTML={{ 
                                                                    __html: item.text.replace(/\n/g, '<br>').replace(
                                                                        /<important>(.*?)<\/important>/g, 
                                                                        (_, p1) => `<span class="font-bold text-blue-600">${p1}</span>`
                                                                    )
                                                                }} />
                                                                <span 
                                                                    className="cursor-pointer text-blue-500 hover:underline ml-2"
                                                                    onClick={() => setSelectedEvidence(result.summary.evidence)}
                                                                >
                                                                    [{evidenceIndex + 1}]
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {steps.relatedQuestions && result.relatedQuestions && result.relatedQuestions.length > 0 && (
                                        <div className={`${index === conversation.length - 1 ? "animate-slide-up" : ""} ${index !== 0 ? "mt-4" : ""}`}>
                                            <h3 className="text-xl font-semibold mb-2">相关问题：</h3>
                                            <ul className="list-disc list-inside text-blue-500 text-lg">
                                                {result.relatedQuestions.map((question, questionIndex) => (
                                                    <li key={questionIndex} className={`cursor-pointer hover:underline ${index === conversation.length - 1 ? "animate-slide-up" : ""}`} style={{animationDelay: `${questionIndex * 300}ms`}} onClick={() => handleSearch(question)}>
                                                        {question}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </React.Fragment>
                            )}
                        </div>
                    );
                })}
            </div>
        ))}
        {isLoading && (
            <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )}
    </div>
);

window.ConversationDisplay = ConversationDisplay;