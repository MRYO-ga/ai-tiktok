// 移除 export 语句
// const { useState, useEffect, useRef } = React;

// 使用全局变量
const SearchInterface = ({ onHistoryUpdate, showInitialSearch, setShowInitialSearch, currentQuestion, isLoading, setIsLoading }) => {
    const [input, setInput] = React.useState('');
    const [selectedModel, setSelectedModel] = React.useState('GPT-3.5');
    const [followUpQuestion, setFollowUpQuestion] = React.useState('');
    const models = ['gpt-3.5-turbo', 'gpt-4'];
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
            setSearchResults(results);
    
            // 2. 同时获取音频URL并转录，但逐个获取评论
            const transcriptionPromises = results.slice(0, 3).map(async (result) => {
                const audioUrl = result.music_url;
                console.log("处理视频转录audioUrl:", audioUrl);
                
                try {
                    const transcription = await window.openaiService.transcribeAudio(audioUrl);
                    return {
                        ...result,
                        transcription: transcription || "该视频没有可转录的语音内容"
                    };
                } catch (error) {
                    console.error("处理视频转录失败:", error);
                    return {
                        ...result,
                        transcription: "音频转换失败"
                    };
                }
            });

            const transcribedResults = await Promise.all(transcriptionPromises);

            // 3. 逐个获取评论
            const processedVideoData = [];
            for (const result of transcribedResults) {
                console.log("获取视频评论", result.title);
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
            setVideoData(processedVideoData);  // 更新视频数据状态
    
            // 4. 将数据发送给AI进行分析
            const aiPrompt = processedVideoData.map((video, index) => `
                视频 ${index + 1}:
                标题: ${video.title}
                作者: ${video.author}
                转录文本: ${video.transcription}
                评论:
                ${video.comments.slice(0, 5).map(comment => `- ${comment.text}`).join('\n')}
            `).join('\n\n');

            console.log("视频和评论获取完成,发送给ai:", aiPrompt);
    
            const response = await window.openaiService.chatCompletion({
                model: selectedModel === 'GPT-4' ? "gpt-4" : "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: `你是一个AI视频搜索助手。请分析以下视频内容和评论,然后按以下格式回答用户的问题：
    
                    回答：
                    [在这里提供对用户问题的详细答案,包括对视频内容和评论的分析和总结。如果某些视频没有语音内容，请说明这一点。]
    
                    证据：
                    1. [从视频内容中提取的支持答案的证据1]
                    2. [证据2]
                    3. [证据3]
    
                    相关评论：
                    1. [相关评论1]
                    2. [相关评论2]
                    3. [相关评论3]
    
                    相关问题：
                    1. [根据视频内容和评论生成的相关问题1]
                    2. [相关问题2]
                    3. [相关问题3]
                    4. [相关问题4]
    
                    请确保严格遵循这个格式。` },
                    { role: "user", content: `问题: ${question}\n\n${aiPrompt}` }
                ],
                max_tokens: 1000
            });
    
            console.log("API响应数据:", response);
            const answer = response.choices[0].message.content;
    
            console.log("开始解析API返回的答案", answer);
            const answerMatch = answer.match(/回答：([\s\S]*?)(?=\n\n证据：|$)/);
            const mainAnswer = answerMatch && answerMatch[1] ? answerMatch[1].trim() : answer;
    
            const evidenceMatch = answer.match(/证据：([\s\S]*?)(?=\n\n相关评论：|$)/);
            const evidence = evidenceMatch && evidenceMatch[1] 
                ? evidenceMatch[1].split('\n').filter(e => e.trim()).map(e => e.replace(/^\d+\.\s*/, ''))
                : [];
    
            const relatedCommentsMatch = answer.match(/相关评论：([\s\S]*?)(?=\n\n相关问题：|$)/);
            const relatedComments = relatedCommentsMatch && relatedCommentsMatch[1]
                ? relatedCommentsMatch[1].split('\n').filter(c => c.trim()).map(c => c.replace(/^\d+\.\s*/, ''))
                : [];
    
            const relatedQuestionsMatch = answer.match(/相关问题：([\s\S]*?)$/);
            const relatedQuestions = relatedQuestionsMatch && relatedQuestionsMatch[1]
                ? relatedQuestionsMatch[1].split('\n').filter(q => q.trim()).map(q => q.replace(/^\d+\.\s*/, ''))
                : [];
    
            console.log("解析完成，更新对话内容");
            console.log("主要回答:", mainAnswer);
            console.log("证据:", evidence);
            console.log("相关评论:", relatedComments);
            console.log("相关问题:", relatedQuestions);

            // 更新对话内容
            setConversations(prevConversations => {
                const updatedConversations = [...prevConversations];
                const currentConversation = updatedConversations[updatedConversations.length - 1];
                const updatedResult = {
                    question: question,
                    isLoading: false,
                    searchedWebsites: processedVideoData.map(result => result.download_url),
                    summary: {
                        conclusion: mainAnswer,
                        evidence: evidence.map((e, index) => ({
                            text: e,
                            source: processedVideoData[index % processedVideoData.length].title,
                            url: processedVideoData[index % processedVideoData.length].download_url
                        }))
                    },
                    relatedQuestions: relatedQuestions,
                    relatedComments: relatedComments,
                    isVideoSearch: true,
                    videoData: processedVideoData
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
                    searchedWebsites: [],
                    summary: { 
                        conclusion: '抱歉,搜索过程中出现错误。',
                        evidence: [{ text: error.message, source: '错误信息', url: '#' }]
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
            console.warn("警告：转录文字为空或未定义");
            return;
        }
        try {
            const response = await axios.post(`${BASE_URL}/process-transcription`, { transcription });
            const { summary, preprocessed } = response.data;

            console.log("转录处理成功，开始生成相关问题");

            const relatedQuestionsResponse = await axios.post(`${BASE_URL}/chat`, {
                model: "gpt-3.5-turbo",
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
            <p className="text-gray-700 mb-2">{evidence.text}</p>
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
