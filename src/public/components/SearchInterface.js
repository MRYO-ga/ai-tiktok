const React = window.React;
const { useState, useEffect, useRef } = React;

const SearchInterface = ({ onHistoryUpdate, showInitialSearch, setShowInitialSearch, currentQuestion, isLoading, setIsLoading }) => {
    const [input, setInput] = React.useState('悉尼旅游攻略');  // 设置默认值
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
            const transcriptionPromises = results.slice(0, 1).map(async (result, videoIndex) => {
                const audioUrl = result.music_url;
                console.log("处理视频转录audioUrl:", audioUrl);
                
                try {
                    // 等待转录完成
                    const transcriptionResult = await window.openaiService.transcribeAudio(audioUrl);
                    console.log("转录完成:", transcriptionResult);

                    // 将 paragraphs 转换为带有时间戳和视频索引的文本
                    const transcriptionText = transcriptionResult.paragraphs.map((p) => 
                        `[indexAudio:${videoIndex}, start:${p.start}, end:${p.end}] ${p.text}`
                    ).join('\n');

                    console.log("转录文本:", transcriptionText);
                    
                    // 转录完成后进行预处理
                    const preprocessedTranscription = await window.openaiService.chatCompletion({
                        model: selectedModel,
                        messages: [
                            { role: "system", content: window.PREPROCESS_PROMPT },
                            { role: "user", content: `视频标题：${result.desc}\n转录文本：${transcriptionText}` }
                        ],
                        // max_tokens: 1000
                    });

                    console.log("预处理完成:", preprocessedTranscription.choices[0].message.content);

                    if (preprocessedTranscription.choices[0].message.content === '<不相关>') {
                        return {
                            ...result,
                            transcription: transcriptionResult.text,
                            transcriptionParagraphs: transcriptionResult.paragraphs,
                            preprocessedTranscription: '<不相关>'
                        };
                    }

                    return {
                        ...result,
                        transcription: transcriptionResult.text,
                        transcriptionParagraphs: transcriptionResult.paragraphs,
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
                        文章 ${index + 1}:
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
                        文章 ${index + 1} 的第 ${commentIndex + 1} 条评论:
                        - ${comment.text}
                        点赞数: ${comment.digg_count}
                        回复数: ${comment.reply_comment_total}
                        `).join('\n');

                return `${baseInfo}${transcription}${comments}`;
            }).join('\n\n');

            console.log("视频和评论获取完成,发送给ai:", aiPrompt);

            const systemPrompt = window.SYSTEM_PROMPT || '你是一个AI助手，请回答用户的问题。';

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
            
            // 确保 answer 包含了所有必要的标记
            console.log("AI返回的答案(包含标记):", answer);

            // 提取相关问题（如果需要的话）
            const relatedQuestions = extractRelatedQuestions(answer);
            console.log("AI返回的相关问题", relatedQuestions);

            setConversations(prevConversations => {
                const updatedConversations = [...prevConversations];
                const currentConversation = updatedConversations[updatedConversations.length - 1];
                const updatedResult = {
                    question: question,
                    isLoading: false,
                    searchedWebsites: processedVideoData.map(result => result.download_url),
                    summary: {
                        conclusion: answer, // 直接使用包含标记的答案
                        evidence: [{ text: answer, source: 'AI回答', url: '#' }]
                    },
                    relatedQuestions: relatedQuestions,
                    isVideoSearch: true,
                    videoData: processedVideoData
                };
                currentConversation[currentConversation.length - 1] = updatedResult;
                return updatedConversations;
            });
            // debug：
            // const exampleAnswer = window.EXAMPLE_ANSWER
            // setConversations(prevConversations => {
            //     const updatedConversations = [...prevConversations];
            //     const currentConversation = updatedConversations[updatedConversations.length - 1];
            //     const updatedResult = {
            //         question: question,
            //         isLoading: false,
            //         searchedWebsites: [],
            //         summary: {
            //             conclusion: exampleAnswer, 
            //             evidence: [{ text: '问题：悉尼', source: 'AI回答', url: '#' }]
            //         },
            //         relatedQuestions: [
            //             "澳洲的特色食材有哪些，如何融入日常饮食？",
            //             "留学生在澳洲的日常生活中，需要面对哪些潜在挑战？"
            //         ],
            //         isVideoSearch: true,
            //         videoData: []
            //     };
            //     currentConversation[currentConversation.length - 1] = updatedResult;
            //     return updatedConversations;
            // });
    
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
                // 处理错...
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
                        
                        {/* <HotTopics handleSearch={handleSearch} /> */}
                        
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
