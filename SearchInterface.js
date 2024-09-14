const { useState, useEffect, useRef, Fragment } = React;

const SearchInterface = ({ onHistoryUpdate, showInitialSearch, setShowInitialSearch, currentQuestion, isLoading, setIsLoading }) => {
    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState('GPT-3.5');
    const [searchResults, setSearchResults] = useState([]);
    const [followUpQuestion, setFollowUpQuestion] = useState('');
    const models = ['gpt-3.5-turbo', 'gpt-4'];
    const resultsContainerRef = useRef(null);
    const [conversations, setConversations] = useState([]);
    const [displaySteps, setDisplaySteps] = useState({});
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [expandedSummaries, setExpandedSummaries] = useState({});
    const [hotTopics, setHotTopics] = useState([]);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [summary, setSummary] = useState('');
    const [fileInputKey, setFileInputKey] = useState(0);
    const [lastHotTopicsUpdate, setLastHotTopicsUpdate] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoUrl, setVideoUrl] = useState('');
    const [processedTranscription, setProcessedTranscription] = useState(null);
    const [transcriptionParagraphs, setTranscriptionParagraphs] = useState([]);
    const [isVideoSearch, setIsVideoSearch] = useState(false);

    const BASE_URL = 'http://localhost:3001/api';

    useEffect(() => {
        console.log("SearchInterface 组件已挂载");
        console.log("初始状态:", { showInitialSearch, currentQuestion, isLoading });
        const fetchHotTopics = async () => {
            const now = new Date();
            if (!lastHotTopicsUpdate || (now - lastHotTopicsUpdate) > 3600000) {
                console.log("开始获取热门话题");
                await generateHotTopics();
                setLastHotTopicsUpdate(now);
            }
        };
        fetchHotTopics();
        return () => {
            console.log("SearchInterface 组件将卸载");
        };
    }, []);

    const generateHotTopics = async () => {
        try {
            console.log("正在生成热门话题");
            const response = await fetch(`${BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "你是一个AI视频搜索助手。请生成3个当前热门的视频相关搜索问题。每个问题应该简短、吸引人，并且当前的热门话题或趋势相关。" },
                        { role: "user", content: "生成热门视搜索问题" }
                    ],
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error('API请求失败');
            }

            const data = await response.json();
            console.log("成功获取热门话题:", data);
            const topics = data.choices[0].message.content.split('\n').filter(topic => topic.trim() !== '');
            console.log("处理后的热门话题:", topics);
            setHotTopics(topics);
        } catch (error) {
            console.error('生成热点问题时出错:', error);
            setHotTopics(["最新病毒视频有哪些？", "如何制作吸引人的短视频？", "AI换脸技术在视的应用趋势是什么？"]);
        }
    };

    const handleSearch = async (question, isNewQuestion = false, isVideoSearch = false) => {
        if (!question.trim()) return;
        console.log(`开始搜索: "${question}", 是否新问题: ${isNewQuestion}, 是否视频搜索: ${isVideoSearch}`);
        setIsLoading(true);
        setShowInitialSearch(false);
        onHistoryUpdate(prevQuestions => [...prevQuestions, question]);

        try {
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

            console.log("发送请求到API");
            const response = await fetch(`${BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel === 'GPT-4' ? "gpt-4" : "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: `你是一个AI视频搜索助手。请按以下格式回答用户的问题：

                                回答：
                                [在这里提供对用户问题的详细答]

                                证据：
                                1. [证据1]
                                2. [证据2]
                                3. [证据3]

                                相关问题：
                                1. [相关问题1]
                                2. [相关问题2]
                                3. [相关问题3]
                                4. [相关问题4]

                                请确保严格遵循这个格式。` },
                        { role: "user", content: question }
                    ],
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API请求失败: ${errorData.error}\n详情: ${JSON.stringify(errorData.details)}`);
            }

            const data = await response.json();
            console.log("API响应数据:", data);
            const answer = data.choices[0].message.content;

            if (!answer || typeof answer !== 'string') {
                throw new Error('API 返回的答案格式不正确');
            }

            console.log("开始解析API返回的答案");
            const answerMatch = answer.match(/回答：([\s\S]*?)(?:\n\n|$)/);
            const mainAnswer = answerMatch && answerMatch[1] ? answerMatch[1].trim() : answer;

            const evidenceMatch = answer.match(/证据([\s\S]*?)(?:\n\n|$)/);
            const evidence = evidenceMatch && evidenceMatch[1] 
                ? evidenceMatch[1].split('\n').filter(e => e.trim()).map(e => e.replace(/^\d+\.\s*/, ''))
                : [];

            const relatedQuestionsMatch = answer.match(/相关问题：([\s\S]*?)(?:\n\n|$)/);
            const relatedQuestions = relatedQuestionsMatch && relatedQuestionsMatch[1]
                ? relatedQuestionsMatch[1].split('\n').filter(q => q.trim()).map(q => q.replace(/^\d+\.\s*/, ''))
                : [];

            console.log("解析完成，更新对话内容");
            setConversations(prevConversations => {
                const updatedConversations = [...prevConversations];
                const currentConversation = updatedConversations[updatedConversations.length - 1];
                const updatedResult = {
                    question: question,
                    isLoading: false,
                    searchedWebsites: isVideoSearch ? [] : ['https://www.openai.com'],
                    summary: {
                        conclusion: mainAnswer,
                        evidence: isVideoSearch ? [] : evidence.map(e => ({
                            text: e,
                            source: 'OpenAI',
                            url: 'https://www.openai.com'
                        }))
                    },
                    relatedQuestions: relatedQuestions,
                    isVideoSearch: isVideoSearch,
                    videoFile: uploadedVideo
                };
                currentConversation[currentConversation.length - 1] = updatedResult;
                return updatedConversations;
            });

            const newConversationId = isNewQuestion ? conversations.length : conversations.length - 1;
            const newResultId = isNewQuestion ? 0 : conversations[newConversationId].length - 1;
            
            const showStepWithScroll = (step) => {
                setDisplaySteps(prev => ({
                    ...prev,
                    [`${newConversationId}-${newResultId}`]: {
                        ...prev[`${newConversationId}-${newResultId}`],
                        [step]: true
                    }
                }));
                setTimeout(() => scrollToBottom(), 100);
            };

            setTimeout(() => showStepWithScroll('question'), 500);
            setTimeout(() => showStepWithScroll('websites'), 1000);
            setTimeout(() => showStepWithScroll('summary'), 1500);
            setTimeout(() => showStepWithScroll('relatedQuestions'), 2000);

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
                        conclusion: '抱歉，搜索过程中出现错误。',
                        evidence: [{
                            text: `错误信息: ${error.message}`,
                            source: '错误详情',
                            url: '#'
                        }]
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

    useEffect(() => {
        if (currentQuestion) {
            setSearchResults([]);
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

    const toggleSummaryExpansion = (evidenceIndex) => {
        setExpandedSummaries(prev => ({
            ...prev,
            [evidenceIndex]: !prev[evidenceIndex]
        }));
    };

    useEffect(() => {
        if (conversations.length > 0) {
            const latestConversation = conversations[conversations.length - 1];
            const latestResult = latestConversation[latestConversation.length - 1];
            setSelectedEvidence(latestResult.summary.evidence);
        }
    }, [conversations]);

    const handleVideoUpload = async (event) => {
        if (DEBUG_MODE) {
            console.log("DEBUG模式: 模拟视频上传");
            setIsLoading(false);
            setUploadProgress(100);
            return;
        }
        const file = event.target.files[0];
        if (file) {
            setIsLoading(true);
            setShowInitialSearch(false);
            console.log("开始上传视频文件:", file.name);
            console.log("文件大小:", file.size, "bytes");
            console.log("文件类型:", file.type);
            setUploadedVideo(file);
            setIsLoading(true);
            setUploadProgress(0);
            setTranscription('');
            setIsVideoSearch(true);

            try {
                console.log('开始处理视频文件');
                
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${BASE_URL}/convert-and-transcribe`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
                }

                const data = await response.json();
                console.log('音频转文字完成');
                console.log('完整转录结果:', data.text);
                console.log('转录结果长度:', data.text.length, '字符');
                setTranscription(data.text);
                setTranscriptionParagraphs(data.paragraphs);

                console.log('开始总结文案');
                await handleProcessTranscription();

            } catch (error) {
                console.error('视频处理出错:', error);
                setTranscription("抱歉，视频处理过程中出现错误：" + error.message);
            } finally {
                setIsLoading(false);
                setUploadProgress(100);
                console.log("视频处理完成");
            }
        }
        setFileInputKey(prevKey => prevKey + 1);
    };

    const handleVideoUrl = async (url) => {
        setIsLoading(true);
        setUploadProgress(0);
        setTranscription('');
        setIsVideoSearch(true);

        try {
            console.log('开始处理视频URL:', url);
            
            const response = await fetch(`${BASE_URL}/convert-and-transcribe-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('音频转文字完成');
            console.log('完整转录结果:', data.text);
            setTranscription(data.text);
            setTranscriptionParagraphs(data.paragraphs);
            console.log('开始总结文案');
            await handleProcessTranscription();
        } catch (error) {
            console.error('视频处理出错:', error);
            setTranscription("抱歉，视频处理过程中出现错误：" + error.message);
        } finally {
            setIsLoading(false);
            setUploadProgress(100);
        }
    };

    useEffect(() => {
        if (transcription) {
            handleProcessTranscription();
        }
    }, [transcription]);

    const handleProcessTranscription = async () => {
        console.log("开始处理转录文字", transcription);
        if (!transcription) {
            console.warn("警告：转录文字为空或未定义");
            return;
        }
        setIsLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/process-transcription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ transcription })
            });

            if (!response.ok) {
                throw new Error('API请求失败');
            }

            const data = await response.json();
            console.log("API 返回的数据:", data);
            setProcessedTranscription(data);
            console.log("processedTranscription 已更新:", data);
            
            setShowInitialSearch(false);
            
            await handleSearch(`总结以下视频内容：${data.summary}`, true, true);

        } catch (error) {
            console.error('处理转录文字时出错:', error);
            setProcessedTranscription(null);
        } finally {
            setIsLoading(false);
            console.log("转录文字处理完成");
        }
    };

    const ImportantSentence = ({ children }) => (
        <span 
            style={{
                fontWeight: 'bold',
                color: '#FF4500',
            }}
        >
            {children}
        </span>
    );

    const renderProcessedTranscription = () => {
        console.log("renderProcessedTranscription 被调用");
        if (!processedTranscription) {
            console.log("processedTranscription 为 null");
            return null;
        }

        const { summary, preprocessed } = processedTranscription;

        console.log("原始预处理文本:", preprocessed);

        const markedPreprocessed = preprocessed.split(/<important>|<\/important>/).map((part, index) => {
            if (index % 2 === 1) {
                console.log("匹配到重要句子:", part);
                return <ImportantSentence key={index}>{part}</ImportantSentence>;
            }
            return part;
        });

        console.log("处理后的文本:", markedPreprocessed);

        return (
            <div className="mb-8 bg-white bg-opacity-10 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">处理结果</h3>
                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">总结：</h4>
                    <p className="text-white mb-4">{summary}</p>
                    <h4 className="text-lg font-semibold text-white mb-2">预处理结果：</h4>
                    <div className="text-white">{markedPreprocessed}</div>
                </div>
            </div>
        );
    };

    const VideoPlayer = ({ videoFile }) => {
        const [videoUrl, setVideoUrl] = React.useState(null);
        const [currentTime, setCurrentTime] = React.useState(0);
        const [duration, setDuration] = React.useState(0);
        const videoRef = React.useRef(null);

        React.useEffect(() => {
            console.log("VideoPlayer 组件挂载或更新, videoFile:", videoFile);
            if (videoFile) {
                const url = URL.createObjectURL(videoFile);
                setVideoUrl(url);
                console.log("创建了视频 URL:", url);
            }
            return () => {
                if (videoUrl) {
                    URL.revokeObjectURL(videoUrl);
                    console.log("释放视频 URL");
                }
            };
        }, [videoFile]);

        const handleTimeUpdate = () => {
            if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
            }
        };

        const handleLoadedMetadata = () => {
            if (videoRef.current) {
                setDuration(videoRef.current.duration);
                console.log("视频元数据加载完成,时长:", videoRef.current.duration);
            }
        };

        const handleSliderChange = (e) => {
            const newTime = parseFloat(e.target.value);
            setCurrentTime(newTime);
            if (videoRef.current) {
                videoRef.current.currentTime = newTime;
            }
        };

        console.log("VideoPlayer 渲染, videoUrl:", videoUrl);

        return (
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">上传的视频：</h3>
                {videoUrl ? (
                    <div>
                        <video 
                            ref={videoRef}
                            controls 
                            className="w-full max-w-lg mx-auto rounded-lg shadow-lg mb-4"
                            src={videoUrl}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onError={(e) => console.error("视频加载错误:", e)}
                            onCanPlay={() => console.log("视频可以开始播放")}
                        >
                            您的浏览器不支持 HTML5 视频。
                        </video>
                        <div className="w-full max-w-lg mx-auto">
                            <input 
                                type="range"
                                min="0"
                                max={duration}
                                value={currentTime}
                                onChange={handleSliderChange}
                                className="w-full"
                            />
                            <div className="flex justify-between text-white text-sm">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-white">视频正在加载中...</p>
                )}
            </div>
        );
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const renderTranscriptionWithTimestamps = () => {
        return (
            <div className="space-y-4">
                {transcriptionParagraphs.map((paragraph, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-3">
                        <p className="text-gray-800 whitespace-pre-wrap">
                            <span className="text-blue-600 font-semibold block mb-1">
                                [{formatTime(paragraph.start)} - {formatTime(paragraph.end)}]
                            </span>
                            {paragraph.text}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const renderEvidenceDetails = (evidence, index) => {
        const isExpanded = expandedSummaries[index];
        const shouldShowExpand = evidence.text.length > 200;
        
        const processedText = evidence.text.split(/<important>|<\/important>/).map((part, partIndex) => {
            if (partIndex % 2 === 1) {
                return <ImportantSentence key={partIndex}>{part}</ImportantSentence>;
            }
            return part;
        });

        return (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{evidence.source}</h4>
                <div className="text-gray-700 mb-2">
                    {shouldShowExpand ? (
                        <React.Fragment>
                            {isExpanded ? processedText : processedText.slice(0, 200)}
                            {shouldShowExpand && (
                                <button 
                                    onClick={() => toggleSummaryExpansion(index)}
                                    className="text-blue-500 hover:underline ml-2 font-medium"
                                >
                                    {isExpanded ? '收起' : '展开更多'}
                                </button>
                            )}
                        </React.Fragment>
                    ) : (
                        processedText
                    )}
                </div>
                <a href={evidence.url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-500 hover:underline font-medium">
                    查看原文
                </a>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {showInitialSearch ? (
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="search-container max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 transition-all duration-300 hover:shadow-xl">
                        <div className="flex justify-center mb-10">
                            <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-md animate-pulse-slow">
                                <span className="text-white font-bold text-4xl">QXX</span>
                            </div>
                        </div>
                        <h2 className="text-5xl font-bold mb-10 text-center text-blue-700">AI视频搜索</h2>
                        
                        <div className="mb-10">
                            <div className="flex">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(e, 'main')}
                                        className="input-field w-full rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-2xl py-4 px-6 bg-white text-gray-800 placeholder-gray-400 transition-all duration-300"
                                        placeholder="搜索视频..."
                                    />
                                </div>
                                <button
                                    onClick={() => handleSearch(input, true)}
                                    className="button rounded-r-full hover:bg-blue-600 transition-all duration-300 px-8 bg-blue-500 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <i className="mdi mdi-loading mdi-spin text-3xl"></i>
                                    ) : (
                                        <i className="mdi mdi-magnify text-3xl"></i>
                                    )}
                                </button>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <select
                                    id="model-select"
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="p-2 border rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all duration-300"
                                >
                                    {models.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="mb-10">
                            <h3 className="text-2xl font-semibold text-blue-700 mb-6">热搜索：</h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {hotTopics.map((topic, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSearch(topic, true)}
                                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {!DEBUG_MODE && (
                            <React.Fragment>
                                <div className="mb-10">
                                    <h3 className="text-2xl font-semibold text-blue-700 mb-6">上传视频：</h3>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                        className="hidden"
                                        id="video-upload"
                                        key={fileInputKey}
                                    />
                                    <label 
                                        htmlFor="video-upload" 
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full cursor-pointer transition-all duration-300 inline-block"
                                    >
                                        选择视频文件
                                    </label>
                                </div>
                                
                                <div className="mb-10">
                                    <h3 className="text-2xl font-semibold text-blue-700 mb-6">输入视频URL：</h3>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            className="input-field flex-1 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 py-3 px-6 transition-all duration-300"
                                            placeholder="输入视频URL..."
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleVideoUrl(videoUrl)}
                                            className="button rounded-r-full hover:bg-blue-600 transition-all duration-300 bg-blue-500 text-white px-8"
                                            disabled={isLoading}
                                        >
                                            处理视频URL
                                        </button>
                                    </div>
                                </div>
                            </React.Fragment>
                        )}

                        {isLoading && (
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full" 
                                        style={{width: `${uploadProgress}%`}}
                                    ></div>
                                </div>
                                <p className="text-white mt-2">上传进度：{uploadProgress}%</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex flex-1 overflow-hidden">
                        <div className="flex-1 overflow-auto space-y-6 p-8">
                            {conversations.map((conversation, convIndex) => (
                                <div key={convIndex} className="result-card p-6 space-y-6">
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
                                                            <VideoPlayer videoFile={result.videoFile} />
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
                        <div className="w-1/3 p-4 bg-gray-100 overflow-auto">
                            {conversations.length > 0 && conversations[conversations.length - 1].length > 0 && (
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    {conversations[conversations.length - 1][conversations[conversations.length - 1].length - 1].isVideoSearch ? (
                                        // 如果是视频搜索,始终显示视频转录
                                        transcriptionParagraphs.length > 0 ? (
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-800 mb-4">视频转录</h3>
                                                <div className="bg-gray-50 rounded-lg p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                                                    {renderTranscriptionWithTimestamps()}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-64">
                                                <p className="text-gray-500 text-lg">视频转录正在处理中...</p>
                                            </div>
                                        )
                                    ) : (
                                        // 如果不是视频搜索,显示证据详情
                                        selectedEvidence && (
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-800 mb-4">依据详情</h3>
                                                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                                                    {selectedEvidence.map((evidence, index) => renderEvidenceDetails(evidence, index))}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-8 border-t">
                        <div className="flex">
                            <input
                                type="text"
                                value={followUpQuestion}
                                onChange={(e) => setFollowUpQuestion(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, 'followUp')}
                                className="input-field flex-1 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="追加问题或开始新对话..."
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSearch(followUpQuestion)}
                                className="button rounded-r-lg hover:bg-blue-600 transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <i className="mdi mdi-loading mdi-spin"></i>
                                ) : (
                                    <i className="mdi mdi-send"></i>
                                )}
                            </button>
                            <button
                                onClick={() => handleSearch(followUpQuestion, true)}
                                className="button bg-green-500 rounded-lg ml-2 hover:bg-green-600 transition-colors"
                                title="开始新对话"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <i className="mdi mdi-loading mdi-spin"></i>
                                ) : (
                                    <i className="mdi mdi-plus"></i>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.SearchInterface = SearchInterface;
