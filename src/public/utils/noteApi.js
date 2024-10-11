const BASE_URL = 'http://localhost:3001/api';  // 请根据您的实际后端地址进行调整

const searchNotesWithRetry = async (keyword, page = 1, sort = 'general', noteType = '_0') => {
    try {
        return await window.xiaohongshuService.searchNotes(keyword, page, sort, noteType);
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log("searchNotes 请求400错误，重试中...");
            return await window.xiaohongshuService.searchNotes(keyword, page, sort, noteType);
        }   
        throw error;
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

const getNoteInfoAndComments = async (noteId) => {
    let noteInfo;
    let comments;
    try {
        // 获取笔记详情
        noteInfo = await getNoteInfoWithRetry(noteId);
        // console.log("作品详情", noteInfo);

        // 获取评论
        let allComments = [];
        let lastCursor = '';
        const MAX_PAGES = 3; // 设置您��要获取的最大页��

        for (let i = 0; i < MAX_PAGES; i++) {
            const commentsPage = await getNoteCommentsWithRetry(noteId, lastCursor);
            if (commentsPage && commentsPage.data && commentsPage.data.data) {
                allComments = allComments.concat(commentsPage.data.data.comments);
                lastCursor = commentsPage.data.data.cursor;
                if (i === 0) {
                    // 只为第一页评论调用提取和打印函数
                    // extractAndPrintComments(commentsPage.data);
                }
                if (!lastCursor) break; // 如果没有更多评论，出循环
            } else {
                break; // 如果获取评论失败，退出循环
            }
        }

        // console.log("所有评论", allComments);
        noteInfo.comments = allComments;
    } catch (error) {
        console.error('获取笔记详情或评论时出错:', error);
        handleErrorResponse(error);
    }
    return noteInfo;
};

// 打印关键信息的函数
const printJsonData = (data) => {
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
                console.log("  赞情况:", item.note.liked);
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

// 提取和打印评论信息
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

const handleErrorResponse = (error) => {
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
                console.log("路��数据未找到");
                break;
            case 402:
                console.log("请求超时");
                break;
            case 429:
                console.log("请求频率过高");
                break;
            case 500:
                console.log("服务器内部错误");
                break;
            default:
                console.log("未知错误");
                break;
        }
    } else {
        console.log("网络请求失败:", error.message);
    }
};

// 将函数挂载到window对象上
window.getNoteInfoAndComments = getNoteInfoAndComments;
window.printJsonData = printJsonData;
window.handleErrorResponse = handleErrorResponse;
window.searchNotesWithRetry = searchNotesWithRetry;

// 新增用户登录函数
const loginUser = async (username, password) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, { username, password });
        if (response.data.token) {
            return {
                success: true,
                token: response.data.token,
                username: response.data.username,
                userId: response.data.userId
            };
        }
        return { success: false };
    } catch (error) {
        console.error('登录失败:', error);
        return { success: false };
    }
};

// 新增保存聊天记录函数
const saveChatHistory = async (userId, conversationId, content) => {
    const token = localStorage.getItem('token');
    if (!token || !userId) {
        console.warn('用户未登录或缺少userId,无法保存聊天记录');
        return false;
    }

    try {
        console.log('Sending save chat history request:', { userId, conversationId, content });
        const response = await axios.post(`${BASE_URL}/auth/save-chat-history`, 
            { userId, conversationId, content: JSON.stringify(content) },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('保存聊天记录成功:', response.data);
        return response.data.success;
    } catch (error) {
        console.error('保存聊天记录失败:', error.response ? error.response.data : error);
        return false;
    }
};

// 修改获取聊天记录函数
const getChatHistory = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token || !userId) {
        console.warn('用户未登录或缺少 userId，无法获取聊天记录');
        return null;
    }

    try {
        const response = await axios.get(`${BASE_URL}/auth/get-chat-history/${userId}`, 
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('获取聊天记录成功:', response.data);
        return response.data;
    } catch (error) {
        console.error('获取聊天记录失败:', error);
        return null;
    }
};

// 将新函数挂载到window对象上
window.loginUser = loginUser;
window.saveChatHistory = saveChatHistory;
window.getChatHistory = getChatHistory;

// 如果 saveChatHistory 函数已经存在,就删除这个重复的声明
// 如果不存在,就保留这个新的声明
if (typeof window.saveChatHistory === 'undefined') {
    // 保存聊天记录
    const saveChatHistory = async (userId, conversationId, content) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/save-chat-history`, {
                userId,
                conversationId,
                content
            });
            return response.data;
        } catch (error) {
            console.error('保存聊天记录失败:', error);
            throw error;
        }
    };

    // 将新函数挂载到window对象上
    window.saveChatHistory = saveChatHistory;
}

// 如果 getChatHistory 函数已经存在,就删除这个重复的声明
// 如果不存在,就保留这个新的声明
if (typeof window.getChatHistory === 'undefined') {
    // 获取聊天记录
    const getChatHistory = async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/auth/get-chat-history/${userId}`);
            return response.data;
        } catch (error) {
            console.error('获取聊天记录失败:', error);
            throw error;
        }
    };

    // 将新函数挂载到window对象上
    window.getChatHistory = getChatHistory;
}