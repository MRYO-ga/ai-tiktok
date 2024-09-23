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
            const results = await window.xiaohongshuService.searchNotes(question);
            // 执行打印函数

            // 打印关键信息的函数
            function printJsonData(data) {
                console.log("响应状态码:", data.code);
                console.log("请求路由:", data.router);
                console.log("请求参数:");
                console.log("  关键词:", data.params.keyword);
                console.log("  页码:", data.params.page);
                console.log("  排序方式:", data.params.sort);
                console.log("  笔记类型:", data.params.noteType);
                
                console.log("\n数据部分:");
                
                if (data.data && data.data.data && data.data.data.items) {
                    data.data.data.items.slice(0, 3).forEach((item, index) => {
                        if (item.note) {
                            console.log(`\n笔记 ${index + 1}：`);
                            console.log("  标题:", item.note.display_title);
                            console.log("  用户昵称:", item.note.user.nickname);
                            console.log("  封面图 URL:", item.note.cover.url_default);
                            console.log("  点赞情况:", item.note.liked);
                            console.log("  点赞数:", item.note.liked_count);
                        }
                        if (item.hot_query) {
                            console.log(`\n热门查询 ${index + 1}：`);
                            console.log("  标题:", item.hot_query.title);
                            item.hot_query.queries.forEach((query) => {
                                console.log("    查询 ID:", query.id);
                                console.log("    查询名称:", query.name);
                                console.log("    查询词:", query.search_word);
                                console.log("    封面图 URL:", query.cover);
                            });
                        }
                    });
                }
                
                console.log("\n记录时间:", data.data.recordTime);
            }

            // 添加新的函数来提取和打印评论信息
            const extractAndPrintComments = (comments) => {
                console.log(`总评论数: ${comments.data.comment_count}`);
                console.log(`一级评论数: ${comments.data.comment_count_l1}`);
                console.log(`是否还有更多评论: ${comments.data.has_more ? '是' : '否'}`);
                console.log(`游标: ${comments.data.cursor}`);

                console.log("\n前10条评论概要:");
                comments.data.comments.slice(0, 10).forEach((comment, index) => {
                    console.log(`${index + 1}. 用户: ${comment.user.nickname}`);
                    console.log(`   内容: ${comment.content}`);
                    console.log(`   点赞数: ${comment.like_count}`);
                    console.log(`   子评论数: ${comment.sub_comment_count}`);
                    if (comment.sub_comments && comment.sub_comments.length > 0) {
                        console.log(`   回复: ${comment.sub_comments[0].content}`);
                    }
                    console.log('');
                });
            };

            printJsonData(results);
            // 获取每个笔记的详细信息
            const detailedResults = await Promise.all(results.data.data.items.slice(0, 1).map(async (item) => {
                if (item.note) {
                    let noteInfo;
                    let comments;
                    try {
                        // 获取笔记详情
                        noteInfo = await getNoteInfoWithRetry(item.note.id);
                        
                        console.log("作品详情", noteInfo);
                        if (noteInfo?.noteInfo?.data?.data?.data) {
                            const { note_list, user } = noteInfo.noteInfo.data.data.data[0];
                            const note = note_list[0];
                            const {
                                share_info: { link },
                                desc,
                                shared_count,
                                comments_count,
                                liked_count,
                                title,
                                image_list
                            } = note;
                            const { image, nickname } = user;
                            
                            console.log("getNoteInfo详情", noteInfo.noteInfo);
                            console.log("note小红书链接", link);
                            console.log("note内容", desc);
                            console.log("分享数", shared_count);
                            console.log("评论数", comments_count);
                            console.log("点赞数", liked_count);
                            console.log("标题", title);
                            console.log("用户头像", image);
                            console.log("用户名", nickname);
                            console.log("原图", image_list[0].original);
                            console.log("低质量图片", image_list[0].url_multi_level.low);
                        }
                        // 获取评论
                        let allComments = [];
                        let lastCursor = '';
                        const MAX_PAGES = 3; // 设置您想要获取的最大页数

                        for (let i = 0; i < MAX_PAGES; i++) {
                            const commentsPage = await getNoteCommentsWithRetry(item.note.id, lastCursor);
                            if (commentsPage && commentsPage.data && commentsPage.data.data) {
                                allComments = allComments.concat(commentsPage.data.data.comments);
                                lastCursor = commentsPage.data.data.cursor;
                                if (i === 0) {
                                    // 只为第一页评论调用提取和打印函数
                                    extractAndPrintComments(commentsPage.data);
                                }
                                if (!lastCursor) break; // 如果没有更多评论，退出循环
                            } else {
                                break; // 如果获取评论失败，退出循环
                            }
                        }

                        console.log("所有评论", allComments);
                        noteInfo.comments = allComments;
                    } catch (error) {
                        console.error('获取笔记详情或评论时出错:', error);
                        if (error.response) {
                            switch (error.response.status) {
                                case 400:
                                    console.log("请求格式错误或参数不正确,或者服务器内部错误");
                                    break;
                                case 401:
                                    console.log("API令牌无效或缺失");
                                    break;
                                case 403:
                                    console.log("缺少路由访问权限或账户问题");
                                    break;
                                case 404:
                                    console.log("路由数据未找到");
                                    break;
                                case 402:
                                    console.log("余额不足，需要付费");
                                    break;
                                case 429:
                                    console.log("请求速度过快，超过速率限制");
                                    break;
                                case 500:
                                    console.log("服务器内部错误");
                                    break;
                                default:
                                    console.log("未知错误");
                            }
                        }
                    }
                    return { ...item, noteInfo };
                }
                return item;
            }));

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

    const getNoteInfoWithRetry = async (noteId) => {
        try {
            return await window.xiaohongshuService.getNoteInfo(noteId);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log("getNoteInfo 请求400错误，重试中...");
                return await window.xiaohongshuService.getNoteInfo(noteId);
            }
            throw error;
        }
    };
    
    const getNoteCommentsWithRetry = async (noteId, lastCursor = '') => {
        try {
            return await window.xiaohongshuService.getNoteComments(noteId, lastCursor);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log("getNoteComments 请求400错误，重试中...");
                return await window.xiaohongshuService.getNoteComments(noteId, lastCursor);
            }
            throw error;
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
