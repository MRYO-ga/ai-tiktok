
const handleSearch = async ({
    question,
    isNewQuestion = false,
    isVideoSearch = false,
    userChoices = null,
    setIsLoading,
    setShowInitialSearch,
    onHistoryUpdate,
    setConversations,
    selectedModel,
    uploadedVideo,
    setSearchResults,
    setInput,
    setFollowUpQuestion,
    setIsVideoSearch,
    setUploadedVideo
}) => {
    if (!question.trim()) return;
    console.log(`开始搜索: "${question}", 是否新问: ${isNewQuestion}, 是否视频搜索: ${isVideoSearch}`);
    setIsLoading(true);
    setShowInitialSearch(false);
    onHistoryUpdate(prevQuestions => [...prevQuestions, question]);

    window.updateConversations(lastResult => ({
        ...lastResult,
        question: question,
        isLoading: true,
        searchedWebsites: [],
        summary: { conclusion: '', evidence: [] },
        relatedQuestions: [],
        isVideoSearch: isVideoSearch,
        videoFile: uploadedVideo,
        loadingStatuses: []
    }));

    if (isNewQuestion) {
        console.log("创建新对话");
        setConversations(prevConversations => [...prevConversations, []]);
    } else {
        console.log("向现有对话添加新结果");
    }

    try {
        // 使用agent拆解用户意图
        window.updateLoadingStatus(setConversations, '分析用户意图');
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
        window.updateConversations(lastResult => ({
            ...lastResult,
            fullIntent: parsedIntent
        }));

        // 使用默认选项或用户选择的选项
        let searchUserChoices = userChoices || parsedIntent.subIntents
            .filter(si => si.options && si.options.length > 0)
            .map(si => ({
                intent: si.intent,
                choices: si.selectedOptions || si.options.slice(0, 1)
            }));

        // 生成搜索关键词
        const searchKeywords = window.generateSearchKeywords(question, searchUserChoices);
        console.log("生成的搜索关键词:", searchKeywords);

        window.updateLoadingStatus(setConversations, '获取搜索结果-小红书');
        // 同时获取小红书和抖音的搜索结果
        let resultsNotes, resultsVideos;
        try {
            resultsNotes = await window.searchNotesWithRetry(question);
            if (resultsNotes && resultsNotes.data) {
                window.printJsonData(resultsNotes.data);
            } else {
                console.log("小红书搜索结果格式不正确:", resultsNotes);
            }
        } catch (error) {
            console.error('小红书搜索失败:', error);
            resultsNotes = { data: { data: { items: [] } } };
        }

        window.updateLoadingStatus(setConversations, '获取搜索结果-抖音');
        try {
            resultsVideos = await window.tiktokDownloaderService.getSearchResults(question);
            console.log("抖音搜索结果:", resultsVideos);
        } catch (error) {
            console.error('抖音搜索失败:', error);
            resultsVideos = [];
        }

        // 处理抖音搜索结果
        window.updateLoadingStatus(setConversations, '获取搜索结果-抖音');
        if (resultsVideos && resultsVideos.length > 0) {
            setSearchResults(resultsVideos);
            window.updateLoadingStatus(setConversations, `找到 ${resultsVideos.length} 个相关视频`);
        }

        // 处理小红书搜索结果
        let xiaohongshuResults = [];
        const NOTES_TO_PROCESS = 1;
        if (resultsNotes && resultsNotes.data && resultsNotes.data.data && Array.isArray(resultsNotes.data.data.items) && resultsNotes.data.data.items.length > 0) {
            window.updateLoadingStatus(setConversations, `找到 ${resultsNotes.data.data.items.length} 个相关笔记`);
            xiaohongshuResults = await Promise.all(resultsNotes.data.data.items.slice(0, NOTES_TO_PROCESS).map(async (item) => {
                try {
                    const noteInfo = await getNoteInfoAndComments(item.note.id);
                    console.log("所有评论", noteInfo.comments);
                    return { ...item, noteInfo };
                } catch (error) {
                    console.error('获取笔记评论失败:', error);
                    window.handleErrorResponse(error);
                    return item;
                }
            }));
        }

        // 合并搜索结果
        const combinedResults = [...xiaohongshuResults, ...resultsVideos];

        if (combinedResults.length === 0) {
            console.log("未找到相关内容");
            window.updateConversations(lastResult => ({
                ...lastResult,
                isLoading: false,
                loadingStatuses: [],
                summary: { conclusion: '未找到相关内容', evidence: [] },
                relatedQuestions: []
            }));
            return;
        }

        window.updateConversations(lastResult => ({
            ...lastResult,
            searchResults: combinedResults.map(result => {
                if (result.noteInfo) {  // 小红书结果
                    return {
                        title: result.noteInfo.title,
                        author: result.noteInfo.user.nickname,
                        likes: result.noteInfo.liked_count,
                        comments: result.noteInfo.comments.length,
                        shares: 0,
                        share_url: ''
                    };
                } else {  // 抖音结果
                    return {
                        origin_cover: result.origin_cover,
                        dynamic_cover: result.dynamic_cover,
                        title: result.desc,
                        author: result.nickname,
                        likes: result.digg_count,
                        comments: result.comment_count,
                        shares: result.share_count,
                        share_url: result.share_url
                    };
                }
            })
        }));

        const VIDEOS_TO_PROCESS = 1;
        const transcriptionPromises = resultsVideos.slice(0, VIDEOS_TO_PROCESS).map(async (result, index) => {
            window.updateLoadingStatus(setConversations, `开始处理视频:${result.desc}`);
            return window.transcribeVideo(result);
        });
        const transcribedResults = await Promise.all(transcriptionPromises);
        window.updateLoadingStatus(setConversations, '获取评论');
        const processedVideoData = [];
        for (const result of transcribedResults) {
            try {
                const tiktokComments = await window.tiktokDownloaderService.getComments(result.share_url);
                processedVideoData.push({
                    ...result,
                    comments: {
                        tiktok: Array.isArray(tiktokComments.data) ? tiktokComments.data : [],
                        xiaohongshu: []
                    }
                });
            } catch (error) {
                console.error("获取评论失败:", error);
                processedVideoData.push({
                    ...result,
                    comments: {
                        tiktok: [],
                        xiaohongshu: []
                    }
                });
            }
        }
        console.log("processedVideoData", processedVideoData);

        window.updateLoadingStatus(setConversations, '提取信息中');
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
            const tiktokComments = video.comments.tiktok ? video.comments.tiktok.slice(0, 3).map((comment, commentIndex) => `
                文章 ${index + 1} 的第 ${commentIndex + 1} 条抖音评论:
                - ${comment.text}
                点赞数: ${comment.digg_count}
                回复数: ${comment.reply_comment_total}
            `).join('\n') : '';
            const xiaohongshuComments = video.comments.xiaohongshu ? video.comments.xiaohongshu.slice(0, 3).map((comment, commentIndex) => `
                    文章 ${index + 1} 的第 ${commentIndex + 1} 条小红书评论:
                    - ${comment.text}
                    点赞数: ${comment.like_count}
                    回复数: ${comment.reply_count}
                `).join('\n') : '';
            return `${baseInfo}\n${transcription}\n${tiktokComments}\n${xiaohongshuComments ? xiaohongshuComments : ''}`;
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
        window.updateLoadingStatus(setConversations, '处理完成');
        // 在处理完所有数据后，更新最终结果
        updateConversations(lastResult => {
            const currentLoadingStatuses = Array.isArray(lastResult.loadingStatuses) ? lastResult.loadingStatuses : [];
            return {
                ...lastResult,
                question: question,
                isLoading: false,
                loadingStatuses: [...currentLoadingStatuses, '处理完成'],
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
        });
    } catch (error) {
        console.error('搜索结果处理失败:', error);
        window.updateConversations(lastResult => {
            const currentLoadingStatuses = Array.isArray(lastResult.loadingStatuses) ? lastResult.loadingStatuses : [];
            return {
                ...lastResult,
                isLoading: false,
                loadingStatuses: [...currentLoadingStatuses, '处理出错'],
                summary: { conclusion: '搜索过程中出现错误，请稍后重试。', evidence: [] },
                relatedQuestions: []
            };
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

window.handleSearch = handleSearch;