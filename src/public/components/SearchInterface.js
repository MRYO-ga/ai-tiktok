const React = window.React;
const { useState, useEffect, useRef } = React;

const SearchInterface = ({ onHistoryUpdate, showInitialSearch, setShowInitialSearch, currentQuestion, isLoading, setIsLoading }) => {
    const [input, setInput] = React.useState('');
    const [selectedModel, setSelectedModel] = React.useState('gpt-4o-mini');
    const [followUpQuestion, setFollowUpQuestion] = React.useState('');
    const models = ['gpt-4o-mini', 'gpt-4', 'gpt-4o', 'gpt-3.5-turbo'];
    const resultsContainerRef = React.useRef(null);
    const [conversations, setConversations] = React.useState([]);
    const [displaySteps, setDisplaySteps] = React.useState({});
    const [selectedEvidence, setSelectedEvidence] = React.useState(null);
    const [uploadedVideo, setUploadedVideo] = React.useState(null);
    const [fileInputKey, setFileInputKey] = React.useState(0);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [videoUrl, setVideoUrl] = React.useState('');
    const [transcriptionParagraphs, setTranscriptionParagraphs] = React.useState([]);
    const [isVideoSearch, setIsVideoSearch] = React.useState(false);
    const [videoData, setVideoData] = React.useState([]);
    const [searchResults, setSearchResults] = React.useState([]);
    const [summary, setSummary] = React.useState('');
  
    const BASE_URL = 'http://localhost:3001/api';

    React.useEffect(() => {
        console.log("SearchInterface 组件已挂载");
        console.log("初始状态:", { showInitialSearch, currentQuestion, isLoading });
        return () => {
            console.log("SearchInterface 组件将卸载");
        };
    }, []);

    const handleSearch = async (question, isNewQuestion = false, isVideoSearch = false) => {
        if (!question.trim()) return;
        console.log(`开始搜索: "${question}", 是否新问: ${isNewQuestion}, 是否视频搜索: ${isVideoSearch}`);
        setIsLoading(true);
        setShowInitialSearch(false);
        onHistoryUpdate(prevQuestions => [...prevQuestions, question]);
    
        setConversations(prevConversations => {
            const newResult = {
                question: question,
                isLoading: true,
                searchedWebsites: [],
                summary: { conclusion: '', evidence: [] },
                relatedQuestions: [],
                isVideoSearch: isVideoSearch,
                videoFile: uploadedVideo
            };
            if (isNewQuestion) {
                console.log("创建新对话");
                return [...prevConversations, [newResult]];
            } else {
                console.log("向现有对话添加新结果");
                const updatedConversations = [...prevConversations];
                updatedConversations[updatedConversations.length - 1].push(newResult);
                return updatedConversations;
            }
        });
    
        try {
            // 1. 获取搜索结果
            console.log("开始获取搜索结果");
            const results = await window.tiktokDownloaderService.getSearchResults(question);
            console.log("获取搜索结果", results);
            // 处理0个视频的情况
            if (results.length === 0) {
                console.log("未找到相关视频");
                setConversations(prevConversations => {
                    const updatedConversations = [...prevConversations];
                    const lastConversation = updatedConversations[updatedConversations.length - 1];
                    lastConversation[lastConversation.length - 1] = {
                        ...lastConversation[lastConversation.length - 1],
                        isLoading: false,
                        summary: { conclusion: '未找到相关视频', evidence: [] },
                        relatedQuestions: []
                    };
                    return updatedConversations;
                });
                setIsLoading(false);
                return;
            }
            setSearchResults(results);
    
            // 2. 同时获取音频URL并转录，但逐个获取评论
            const transcriptionPromises = results.slice(0, 1).map(async (result) => {
                const audioUrl = result.music_url;
                console.log("处理视频转录audioUrl:", audioUrl);
                
                try {
                    // 等待转录完成
                    const transcription = await window.openaiService.transcribeAudio(audioUrl);
                    console.log("转录完成:", transcription);

                    // 转录完成后进行预处理
                    const preprocessedTranscription = await window.openaiService.chatCompletion({
                        model: selectedModel,
                        messages: [
                            { role: "system", content: `
                                你是一个文本处理助手。我给你提供视频标题和转录文本，
                                你先判断转录文本是否与视频标题相关，如果相关，则请对文本进行提取处理，否则输出<不相关>。
                                
                                处理要求：
                                1、去除冗余的话（文章的举例千万不要去除，可以进行适当总结）
                                2、保留原文的举例
                                3、保留因果关系的论证
                                4、保持好原文的推理逻辑，（因为、所以）
                                5、去除人称视角
                                6、注意错别字和不通顺的句子（酌情修改）
                                7、划分句子和段落，不要一长段文字，可以划分成多个点` },
                            { role: "user", content: `视频标题：${result.desc}\n转录文本：${transcription}` }
                        ],
                        // max_tokens: 1000
                    });

                    console.log("预处理完成:", preprocessedTranscription.choices[0].message.content);

                    if (preprocessedTranscription.choices[0].message.content === '<不相关>') {
                        return {
                            ...result,
                            transcription: transcription,
                            preprocessedTranscription: '<不相关>'
                        };
                    }

                    return {
                        ...result,
                        transcription: transcription,
                        preprocessedTranscription: preprocessedTranscription.choices[0].message.content
                    };
                } catch (error) {
                    console.error("处理视频转录失败:", error);
                    return {
                        ...result,
                        transcription: "音频转换失败",
                        preprocessedTranscription: "预处理失败"
                    };
                }
            });

            const transcribedResults = await Promise.all(transcriptionPromises);
            console.log("所有视频转录和预处理完成:", transcribedResults);

            // 3. 逐个获取评论
            const processedVideoData = [];
            for (const result of transcribedResults) {
                try {
                    const comments = await window.tiktokDownloaderService.getComments(result.share_url);
                    processedVideoData.push({
                        ...result,
                        comments: comments.data || []
                    });
                } catch (error) {
                    console.error("获取评论失败:", error);
                    processedVideoData.push({
                        ...result,
                        comments: []
                    });
                }
            }

            console.log("处理后的视频数据:", processedVideoData);  // 更新视频数据状态
            // 4. 将数据发送给AI进行分析
            const aiPrompt = processedVideoData.slice(0, 3).map((video, index) => {
                const baseInfo = `
                        视频 ${index + 1}:
                        标题: ${video.desc}
                        作者: ${video.nickname}
                        点赞数: ${video.digg_count}
                        评论数: ${video.comment_count}
                        收藏数: ${video.collect_count}
                        分享数: ${video.share_count}
                        `;

                                        const transcription = video.preprocessedTranscription === '<不相关>' ? '' : `
                        预处理后的转录文本: ${video.preprocessedTranscription}
                        `;

                                        const comments = video.comments.slice(0, 3).map((comment, commentIndex) => `
                        视频 ${index + 1} 的第 ${commentIndex + 1} 条评论:
                        - ${comment.text}
                        点赞数: ${comment.digg_count}
                        回复数: ${comment.reply_comment_total}
                        `).join('\n');

                return `${baseInfo}${transcription}${comments}`;
            }).join('\n\n');

            console.log("视频和评论获取完成,发送给ai:", aiPrompt);
        
            const systemPrompt = `
                你将接收到多个视频的数据，视频主题涉及旅游、消费分析、教育、生活方式、科技、娱乐、文化、商业等。每个视频提供以下内容：

                视频标题
                作者信息
                视频点赞、评论、收藏、分享数据
                预处理后的转录文本
                高互动评论
                你的任务是生成一份完整而详细的回答（汇总报告），请确保以下几点：

                1、整合多个视频内容
                视频内容的详细保留: 在汇总多个视频的内容时，不能简化或省略具体细节。包括但不限于地点、价格、体验、感受等具体信息都必须完整保留。例如，旅游视频中关于花费、景点安排、餐饮等细节，必须逐一展现出来。
                避免按视频列举: 不得逐一���出每个视频的内容，而是将多个视频的内容有机整合在一起，通过主题（如花费、景点、交通等）分类进行汇总。
                保留原始文本风格: 视频转录文本中的语言风格、叙述方式应保持一致，不应修改原文风格，不得进行任何简化、提炼或概括。

                2、呈现不同观点和多样化信息
                不同视频的观点对比: 如果不同视频对同一主题有不同观点（例如花费、旅行体验、推荐的景点等），必须将这些观点逐一呈现。所有不同的立场、角度和细节都需完整保留，不得归类合并或简化。
                评论的多样性和细节保留: 汇总评论时，需完整呈现每一个评论的内容，确保每个不同的观点、情绪、风格都能体现出来。例如支持与反对的观点、质疑或补充的评论，均需按原文呈现，不做简化。**如果评论与特定视频的观点相关，应将这些评论与相应的观点主题整合在一起，而不是全部分开处理。**
                确保每个评论的独特性: 不将相似的评论进行归类或整合，每个评论都应独立存在，展现出评论者的具体语气和表达方式。

                3、细节忠实还原
                不做总结或简化: ��成的汇总报告不应做个人总结或分析，所有信息必须忠实还原原始转录内容。不得得出任何个人结论或归纳。
                按细分主题整合: 内容需按照不同的细分主题（如交通、住宿、景点推荐、行程安排等）进行有机整合，而不是按视频逐一列举。整合过程中应保证每个主题下的视频细节和观点保持完整呈现。
                评论不按视频分开: 评论的汇总也应以主题为导向，而不是按视频列举。确保评论内容展示中，既能看到对同一问题的不同看法，也能通过主题呈现评论者的各类细节反馈。
                保留原文的形容词: 在汇总报告中，务必保留原文中的所有形容词，以保持原文的描述风格和情感色彩。

                4、标注视频来源: 在汇总时，不要提到"第n个视频"，而是在相应的语句后面标注[来源视频n]，以便准确标识信息来源。

                例如，在展示多个视频关于悉尼的花费时，你需要将多个视频中的具体细节汇总在一起：包括住宿地点、交通方式、具体价格等，完整展现原始细节，同时保持各个视频的独立观点。如果一个视频认为花费合理，而另一个视频认为过高，你需将这两种观点并列呈现，保留细节，避免过度归类。同样，在高互动评论部分，你需保持评论的多样性。

                **如果评论与特定视频的观点相关，应将这些评论与相应的观点主题整合在一起，而不是全部分开处理。
                **每个评论者的观点（无论是正面、负面、补充信息或提问）��需逐一呈现，并保留评论中的具体表达和风格，不将相似评论合并为一个大类。

                请直接开始你的回答，无需额外的总结或引言。在回答的最后，请提供5个相关问题。
            `;

            const response = await window.openaiService.chatCompletion({
                model: selectedModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `问题: ${question}\n\n${aiPrompt}` }
                ],
                // max_tokens: 2000
            });
    
            console.log("API响应数据:", response);
            let answer = response.choices[0].message.content;
            
            console.log("AI返回的答案(Markdown格式)", answer);
    
            // 提取相关问题（如果需要的话）
            const relatedQuestions = extractRelatedQuestions(answer);
    
            setConversations(prevConversations => {
                const updatedConversations = [...prevConversations];
                const currentConversation = updatedConversations[updatedConversations.length - 1];
                const updatedResult = {
                    question: question,
                    isLoading: false,
                    searchedWebsites: processedVideoData.map(result => result.download_url),
                    summary: {
                        conclusion: answer, // 直接使用 Markdown 格式的答案
                        evidence: [{ text: answer, source: 'AI回答', url: '#' }]
                    },
                    relatedQuestions: relatedQuestions,
                    isVideoSearch: true,
                    videoData: processedVideoData
                };
                currentConversation[currentConversation.length - 1] = updatedResult;
                return updatedConversations;
            });
    
        } catch (error) {
            // console.error('搜索过程中错误:', error);
            console.error('错误详情:', error.response ? error.response.data : '无详细信息');
            
            let errorMessage = '抱歉，搜索过程中出现错误。';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage += ` 错误信息: ${error.response.data.error.message || error.response.data.error}`;
            } else if (error.message) {
                errorMessage += ` ${error.message}`;
            }

            setConversations(prevConversations => {
                const updatedConversations = [...prevConversations];
                const currentConversation = updatedConversations[updatedConversations.length - 1];
                const errorResult = {
                    question: question,
                    isLoading: false,
                    searchedWebsites: [],
                    summary: { 
                        conclusion: errorMessage,
                        evidence: [{ text: errorMessage, source: '错误信息', url: '#' }]
                    },
                    relatedQuestions: [],
                    isVideoSearch: isVideoSearch,
                    videoFile: uploadedVideo
                };
                currentConversation[currentConversation.length - 1] = errorResult;
                return updatedConversations;
            });
        } finally {
            setIsLoading(false);
            setInput('');
            setFollowUpQuestion('');
            if (!isVideoSearch) {
                setIsVideoSearch(false);
                setUploadedVideo(null);
            }
            console.log("搜索过程完成");
            setShowInitialSearch(false);
        }
    };

    // 辅助函数：从答案中提取相关问题（如果需要的话）
    const extractRelatedQuestions = (answer) => {
        const relatedQuestionsMatch = answer.match(/##\s*相关问题：([\s\S]*?)(?=##|$)/);
        if (relatedQuestionsMatch) {
            return relatedQuestionsMatch[1].split('\n')
                .map(q => q.trim())
                .filter(q => q && !q.startsWith('#'));
        }
        return [];
    };
    const scrollToBottom = () => {
        if (resultsContainerRef.current) {
            resultsContainerRef.current.scrollTop = resultsContainerRef.current.scrollHeight;
        }
    };

    React.useEffect(() => {
        if (currentQuestion) {
            setConversations([]);
            handleSearch(currentQuestion);
        }
    }, [currentQuestion]);

    const handleKeyPress = (e, inputType) => {
        if (e.key === 'Enter') {
            if (inputType === 'main') {
                handleSearch(input, true);
            } else if (inputType === 'followUp') {
                handleSearch(followUpQuestion);
            }
        }
    };

    const handleVideoUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsLoading(true);
            setUploadedVideo(file);
            setIsVideoSearch(true);
            setShowInitialSearch(false);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post(`${BASE_URL}/convert-and-transcribe`, formData, {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    },
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                setTranscriptionParagraphs(response.data.paragraphs);
                await handleProcessTranscription(response.data.text, file);
            } catch (error) {
                console.error('Error uploading video:', error);
                // 处理错误...
            } finally {
                setIsLoading(false);
                setUploadProgress(0);
                setFileInputKey(prevKey => prevKey + 1);
            }
        }
    };

    const handleVideoUrl = async () => {
        if (videoUrl) {
            setIsLoading(true);
            setIsVideoSearch(true);
            setShowInitialSearch(false);

            try {
                const response = await axios.post(`${BASE_URL}/convert-and-transcribe-url`, { url: videoUrl });

                setTranscriptionParagraphs(response.data.paragraphs);
                await handleProcessTranscription(response.data.text);
            } catch (error) {
                console.error('Error processing video URL:', error);
                // 处理错误...
            } finally {
                setIsLoading(false);
                setVideoUrl('');
            }
        }
    };

    const handleProcessTranscription = async (transcription, videoFile) => {
        console.log("开始处理转录文字", transcription);
        if (!transcription) {
            console.warn("警：转录文字为空或未定义");
            return;
        }
        try {
            const response = await axios.post(`${BASE_URL}/process-transcription`, { transcription });
            const { summary, preprocessed } = response.data;

            console.log("转录处理成功，开始生成相关问题");

            const relatedQuestionsResponse = await axios.post(`${BASE_URL}/chat`, {
                model: selectedModel,
                messages: [
                    { role: "system", content: "你是一个AI助手，根据给定的文本生成5个相关的问题。" },
                    { role: "user", content: transcription }
                ]
            });

            console.log("相关问题生成成功", relatedQuestionsResponse.data);

            let relatedQuestions = [];
            if (relatedQuestionsResponse.data && relatedQuestionsResponse.data.choices && relatedQuestionsResponse.data.choices[0]) {
                relatedQuestions = relatedQuestionsResponse.data.choices[0].message.content
                    .split('\n')
                    .filter(question => question.trim() !== '')
                    .map(question => question.replace(/^\d+\.\s*/, '').trim());
            } else {
                console.warn("无法从响应中提取相关问题");
            }

            setConversations([
                [{
                    question: "视频内容总结",
                    isLoading: false,
                    searchedWebsites: [],
                    summary: {
                        conclusion: summary,
                        evidence: [{ text: preprocessed, source: '视频转录', url: '#' }]
                    },
                    relatedQuestions: relatedQuestions,
                    isVideoSearch: true,
                    videoFile: videoFile
                }]
            ]);
        } catch (error) {
            console.error('处理转录时出错:', error);
            let errorMessage = '处理视频转录时出现未知错误。';
            if (error.response) {
                console.error('错误数据:', error.response.data);
                console.error('错误状态:', error.response.status);
                console.error('错误头信息:', error.response.headers);
                errorMessage = error.response.data.error || errorMessage;
            } else if (error.request) {
                console.error('未收到应答:', error.request);
                errorMessage = '服务器未响应，请稍后再试。';
            } else {
                console.error('错误信息:', error.message);
                errorMessage = error.message;
            }
            setConversations([
                [{
                    question: "视频内容总结",
                    isLoading: false,
                    searchedWebsites: [],
                    summary: {
                        conclusion: '抱歉，处理视频转录时出现错误。',
                        evidence: [{
                            text: `错误信息: ${errorMessage}`,
                            source: '错误详情',
                            url: '#'
                        }]
                    },
                    relatedQuestions: [],
                    isVideoSearch: true,
                    videoFile: videoFile
                }]
            ]);
        }
    };

    const renderEvidenceDetails = (evidence, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-gray-700 mb-2 whitespace-pre-wrap">{evidence.text}</div>
            <p className="text-sm text-gray-500">
                来源: <a href={evidence.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{evidence.source}</a>
            </p>
        </div>
    );

    const renderTranscriptionWithTimestamps = () => (
        transcriptionParagraphs.map((paragraph, index) => (
            <p key={index} className="mb-4">
                <span className="text-gray-500">[{formatTime(paragraph.start)} - {formatTime(paragraph.end)}] </span>
                {paragraph.text}
            </p>
        ))
    );

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full">
            {showInitialSearch ? (
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="search-container max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 transition-all duration-300 hover:shadow-xl">
                        {/* <div className="flex justify-center mb-10">
                            <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-md animate-pulse-slow">
                                <span className="text-white font-bold text-4xl">QXX</span>
                            </div>
                        </div> */}
                        {/* <h2 className="text-5xl font-bold mb-10 text-center text-blue-700">AI视频搜索</h2> */}
                        
                        <SearchBar 
                            input={input}
                            setInput={setInput}
                            handleSearch={handleSearch}
                            isLoading={isLoading}
                            handleKeyPress={handleKeyPress}
                        />
                        
                        <div className="mt-4 flex justify-between items-center">
                            <ModelSelector 
                                selectedModel={selectedModel}
                                setSelectedModel={setSelectedModel}
                                models={models}
                            />
                        </div>
                        
                        <HotTopics handleSearch={handleSearch} />
                        
                        <VideoUploader 
                            handleVideoUpload={handleVideoUpload}
                            fileInputKey={fileInputKey}
                        />
                        
                        <VideoUrlInput 
                            videoUrl={videoUrl}
                            setVideoUrl={setVideoUrl}
                            handleVideoUrl={handleVideoUrl}
                            isLoading={isLoading}
                        />

                        {isLoading && (
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full" 
                                        style={{width: `${uploadProgress}%`}}
                                    ></div>
                                </div>
                                <p className="text-blue-700 mt-2">上传进度：{uploadProgress}%</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex flex-1 overflow-hidden">
                        <ConversationDisplay 
                            conversations={conversations}
                            displaySteps={displaySteps}
                            VideoPlayer={VideoPlayer}
                            setSelectedEvidence={setSelectedEvidence}
                            handleSearch={handleSearch}
                            isLoading={isLoading}
                        />
                        <EvidenceDisplay 
                            conversations={conversations}
                            selectedEvidence={selectedEvidence}
                            transcriptionParagraphs={transcriptionParagraphs}
                            renderEvidenceDetails={renderEvidenceDetails}
                            renderTranscriptionWithTimestamps={renderTranscriptionWithTimestamps}
                            videoData={videoData}
                        />
                    </div>
                    <FollowUpInput 
                        followUpQuestion={followUpQuestion}
                        setFollowUpQuestion={setFollowUpQuestion}
                        handleKeyPress={handleKeyPress}
                        handleSearch={handleSearch}
                        isLoading={isLoading}
                    />
                </div>
            )}
        </div>
    );
};

// 将组件挂载到全局对象上
window.SearchInterface = SearchInterface;
