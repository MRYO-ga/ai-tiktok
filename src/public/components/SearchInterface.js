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
    const [waitingForUserChoices, setWaitingForUserChoices] = useState(null);

    const BASE_URL = 'http://localhost:3001/api';

    React.useEffect(() => {
        console.log("SearchInterface 组件已挂载");
        console.log("初始状态:", { showInitialSearch, currentQuestion, isLoading });
        return () => {
            console.log("SearchInterface 组件将卸载");
        };
    }, []);

    const handleSearch = async (question, isNewQuestion = false, isVideoSearch = false, userChoices = null) => {
        if (!question.trim()) return;
        console.log(`开始搜索: "${question}", 是否新问: ${isNewQuestion}, 是否视频搜索: ${isVideoSearch}`);
        setIsLoading(true);
        setShowInitialSearch(false);
        onHistoryUpdate(prevQuestions => [...prevQuestions, question]);

        const updateLoadingStatus = (status) => {
            setConversations(prevConversations => {
                const updatedConversations = [...prevConversations];
                const currentConversation = updatedConversations[updatedConversations.length - 1];
                const lastResult = currentConversation[currentConversation.length - 1];
                lastResult.loadingStatuses = [...(lastResult.loadingStatuses || []), status];
                return updatedConversations;
            });
        };

        setConversations(prevConversations => {
            const newResult = {
                question: question,
                isLoading: true,
                searchedWebsites: [],
                summary: { conclusion: '', evidence: [] },
                relatedQuestions: [],
                isVideoSearch: isVideoSearch,
                videoFile: uploadedVideo,
                loadingStatuses: []
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
            // 使用agent拆解用户意图
            updateLoadingStatus('分析用户意图');
            const intentAnalysis = await window.openaiService.chatCompletion({
                model: selectedModel,
                messages: [
                    { role: "system", content: window.INTENT_PROMPT },
                    { role: "user", content: question }
                ],
            });
            
            const userIntent = intentAnalysis.choices[0].message.content;

            // 解析用户意图
            let parsedIntent;
            try {
                parsedIntent = JSON.parse(userIntent);
            } catch (error) {
                console.error("解析用户意图时出错:", error);
                throw new Error("无法解析用户意图，请重试");
            }

            if (!parsedIntent || !parsedIntent.mainIntent || !parsedIntent.subIntents || !parsedIntent.processInference) {
                throw new Error("用户意图分析结果格式不正确，请重试");
            }

            console.log("用户意图:", parsedIntent.processInference);

            // 更新对话状态，包含全部提问意图
            setConversations(prevConversations => {
                const updatedConversations = [...prevConversations];
                const currentConversation = updatedConversations[updatedConversations.length - 1];
                const lastResult = currentConversation[currentConversation.length - 1];
                lastResult.fullIntent = parsedIntent;
                return updatedConversations;
            });

            // 使用默认选项或用户选择的选项
            let searchUserChoices = userChoices || parsedIntent.subIntents
                .filter(si => si.options && si.options.length > 0)
                .map(si => ({
                    intent: si.intent,
                    choices: si.selectedOptions || si.options.slice(0, 1)
                }));

            // 生成搜索关键词
            const searchKeywords = generateSearchKeywords(question, searchUserChoices);

            console.log("生成的搜索关键词:", searchKeywords);

            updateLoadingStatus('获取搜索结果');
            console.log("开始获取搜索结果");
            const results = await window.tiktokDownloaderService.getSearchResults(question);
            console.log("获取搜索结果", results);

            setSearchResults(results);  // 保存搜索结果

            updateLoadingStatus(`找到 ${results.length} 个相关视频`);

            if (results.length === 0) {
                console.log("未找到相关视频");
                setConversations(prevConversations => {
                    const updatedConversations = [...prevConversations];
                    const lastConversation = updatedConversations[updatedConversations.length - 1];
                    lastConversation[lastConversation.length - 1] = {
                        ...lastConversation[lastConversation.length - 1],
                        isLoading: false,
                        loadingStatuses: [],
                        summary: { conclusion: '未找到相关视频', evidence: [] },
                        relatedQuestions: []
                    };
                    return updatedConversations;
                });
                setIsLoading(false);
                return;
            }

            // 在这里添加显示搜索结果的逻辑
            setConversations(prevConversations => {
                const updatedConversations = [...prevConversations];
                const currentConversation = updatedConversations[updatedConversations.length - 1];
                const updatedResult = {
                    ...currentConversation[currentConversation.length - 1],
                    searchResults: results.slice(0, 10).map(result => ({
                        origin_cover: result.origin_cover,
                        dynamic_cover: result.dynamic_cover,
                        title: result.desc,
                        author: result.nickname,
                        likes: result.digg_count,
                        comments: result.comment_count,
                        shares: result.share_count,
                        share_url: result.share_url
                    }))
                };
                currentConversation[currentConversation.length - 1] = updatedResult;
                return updatedConversations;
            });

            const VIDEOS_TO_PROCESS = 3;
            const transcriptionPromises = results.slice(0, VIDEOS_TO_PROCESS).map(async (result, index) => {
                updateLoadingStatus(`开始处理视频:${result.desc}`);
                const audioUrl = result.music_url;
                console.log("处理视频转录audioUrl:", audioUrl);
                
                try {
                    // 等待转录完成
                    const transcriptionResult = await window.openaiService.transcribeAudio(audioUrl);
                    console.log("转录完成:", transcriptionResult);

                    return {
                        ...result,
                        transcription: transcriptionResult.text,
                        transcriptionParagraphs: transcriptionResult.paragraphs
                    };
                } catch (error) {
                    console.error("处理视频转录失败:", error);
                    return {
                        ...result,
                        transcription: "音频转换失败",
                        transcriptionParagraphs: []
                    };
                }
            });

            const transcribedResults = await Promise.all(transcriptionPromises);

            updateLoadingStatus('获取评论');
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

            console.log("处理后的视频数据:", processedVideoData);

            updateLoadingStatus('提取信息中');
            const collectedArticlesAndComments = processedVideoData.slice(0, VIDEOS_TO_PROCESS).map((video, index) => {
                const baseInfo = `
                        文章 ${index + 1}:
                        标题: ${video.desc}
                        作者: ${video.nickname}
                        点赞数: ${video.digg_count}
                        评论数: ${video.comment_count}
                        收藏数: ${video.collect_count}
                        分享数: ${video.share_count}
                        `;

                const transcription = video.transcriptionParagraphs.map((p) => 
                            `[indexAudio:${index}, start:${p.start}, end:${p.end}] ${p.text}`
                        ).join('\n');

                const comments = video.comments.slice(0, 3).map((comment, commentIndex) => `
                        文章 ${index + 1} 的第 ${commentIndex + 1} 条评论:
                        - ${comment.text}
                        点赞数: ${comment.digg_count}
                        回复数: ${comment.reply_comment_total}
                        `).join('\n');

                return `${baseInfo}\n${transcription}\n${comments}`;
            }).join('\n\n');

            console.log("视频和评论获取完成:", collectedArticlesAndComments);

            // 使用 SEARCH_AGENT 进行预处理
            const searchAgentResponse = await window.openaiService.chatCompletion({
                model: selectedModel,
                messages: [
                    { role: "system", content: window.SEARCH_AGENT },
                    { role: "user", content: `问题: ${question}\n\n${collectedArticlesAndComments}` }
                ],
            });

            let searchAgentResult;
            try {
                searchAgentResult = JSON.parse(searchAgentResponse.choices[0].message.content);
                console.log("检索和提取结果:", searchAgentResult);
            } catch (error) {
                console.error("解析预处理结果失败:", error);
                searchAgentResult = { relevantParagraphs: [], relevantComments: [] };
            }

            // 根据用户意图预生成答案
            const preGeneratedAnswer = await window.openaiService.chatCompletion({
                model: selectedModel,
                messages: [
                    { role: "system", content: `根据用户意图${collectedArticlesAndComments}生成一个详细全面的答案。` },
                    { role: "user", content: `问题: ${question}\n` }
                ],
            });

            const preGeneratedAnswerText = preGeneratedAnswer.choices[0].message.content;

            // 准备最终的AI输入
            const answerAgentInput = `
                问题: ${question}

                用户意图: ${parsedIntent.processInference}

                预生成答案: ${preGeneratedAnswerText}

                相关段落:
                ${searchAgentResult.relevantParagraphs.map(p => 
                    `[indexAudio:${p.indexAudio}, start:${p.start}, end:${p.end}] ${p.text}`
                ).join('\n')}

                相关评论:
                ${searchAgentResult.relevantComments.map(c => 
                    `[indexAudio:${c.indexAudio}, commentIndex:${c.commentIndex}] ${c.text}`
                ).join('\n')}
            `;

            console.log('生成答案中', answerAgentInput);
            const response = await window.openaiService.chatCompletion({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: window.ANSWER_PROMPT },
                    { role: "user", content: answerAgentInput }
                ],
            });

            console.log("API响应数据:", response);
            let answer = response.choices[0].message.content;
            
            console.log("AI返回的答案(Markdown格式)", answer);

            // 提取相关问题并更新答案
            const { questions: relatedQuestions, updatedAnswer } = extractRelatedQuestions(answer);
            console.log("AI返回的相关问题", relatedQuestions);
            console.log("更新后的答案", updatedAnswer);

            updateLoadingStatus('处理完成');

            // 在处理完所有数据后，更新最终结果
            setConversations(prevConversations => {
                const updatedConversations = [...prevConversations];
                const currentConversation = updatedConversations[updatedConversations.length - 1];
                const updatedResult = {
                    ...currentConversation[currentConversation.length - 1],
                    question: question,
                    isLoading: false,
                    loadingStatuses: [...currentConversation[currentConversation.length - 1].loadingStatuses, '处理完成'],
                    searchedWebsites: processedVideoData.map(result => result.download_url),
                    summary: {
                        conclusion: updatedAnswer,
                        evidence: searchAgentResult.relevantParagraphs.map(p => ({
                            text: p.text,
                            source: `视频 ${p.indexAudio + 1}`,
                            start: p.start,
                            end: p.end
                        }))
                    },
                    relatedQuestions: relatedQuestions,
                    isVideoSearch: true,
                    videoData: processedVideoData,
                    processedVideoCount: VIDEOS_TO_PROCESS,
                    userIntent: searchAgentResult.processInference
                };
                currentConversation[currentConversation.length - 1] = updatedResult;
                return updatedConversations;
            });
        } catch (error) {
            console.error('搜索过程中错误:', error);
            setConversations(prevConversations => {
                const updatedConversations = [...prevConversations];
                const currentConversation = updatedConversations[updatedConversations.length - 1];
                const errorResult = {
                    question: question,
                    isLoading: false,
                    loadingStatuses: [],
                    searchedWebsites: [],
                    summary: { 
                        conclusion: `搜索过程中出现错误: ${error.message}`,
                        evidence: [{ text: `错误: ${error.message}`, source: '错误信息', url: '#' }]
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

    const extractRelatedQuestions = (answer) => {
        const relatedQuestionsMatch = answer.match(/相关问题：([\s\S]*?)(?=\n\n|$)/);
        if (relatedQuestionsMatch) {
            const relatedQuestionsText = relatedQuestionsMatch[1];
            const questions = relatedQuestionsText.split('\n')
                .map(q => q.trim())
                .filter(q => q && !q.startsWith('#') && !q.startsWith('相关问题：'));
            
            // 从原文中删除相关问题部分
            answer = answer.replace(/相关问题：[\s\S]*?(?=\n\n|$)/, '').trim();
            
            return { questions, updatedAnswer: answer };
        }
        return { questions: [], updatedAnswer: answer };
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
    
    // 新增辅助函数
    const generateSearchKeywords = (userQuestion, userChoices) => {
        if (!userChoices || userChoices.length === 0) {
            return [userQuestion]; // 如果没有用户选择,只返回原始问题
        }
        
        const baseKeywords = [userQuestion];
        const choiceKeywords = userChoices.flatMap(choice => choice.choices).filter(Boolean);
        
        // 生成不同组合的搜索关键词
        const combinations = [
            ...baseKeywords,
            ...choiceKeywords.map(keyword => `${userQuestion} ${keyword}`),
            `${userQuestion} ${choiceKeywords.join(' ')}`
        ];
        
        // 去重并返回
        return [...new Set(combinations)];
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
                            waitingForUserChoices={waitingForUserChoices}
                            setConversations={setConversations}
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
