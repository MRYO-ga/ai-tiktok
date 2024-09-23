// SEARCH = {
//     "type": {
//         "综合": 0,
//         "视频": 1,
//         "用户": 2,
//         "直播": 3,
//         "综合搜索": 0,
//         "视频搜索": 1,
//         "用户搜索": 2,
//         "直播搜索": 3,
//         "0": 0,
//         "1": 1,
//         "2": 2,
//         "3": 3,
//     },
//     "type_text": {
//         0: "综合搜索",
//         1: "视频搜索",
//         2: "用户搜索",
//         3: "直播搜索",
//     },
//     "sort": {
//         "综合排序": 0,
//         "最新发布": 2,
//         "最多点赞": 1,
//         "0": 0,
//         "1": 1,
//         "2": 2,
//     },
//     "sort_text": {
//         0: "综合排序",
//         2: "最新发布",
//         1: "最多点赞",
//     },
//     "publish_text": {
//         0: "不限",
//         1: "一天内",
//         7: "一周内",
//         182: "半年内",
//     },
// }

// tiktokDownloaderService
window.tiktokDownloaderService = {
    getSearchResults: async (keyword, type = '0', pages = '1', sort_type = '0', publish_time = '0') => {
        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keyword, type, pages, sort_type, publish_time }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
            }
            const data = await response.json();
            return data.map(item => ({
                ...item,
                duration: formatDuration(item.duration),
                create_time: item.create_time
            }));
        } catch (error) {
            console.error('获取搜索结果时出错:', error);
            throw error;
        }
    },
    analyzeAudio: async (musicUrl) => {
        try {
            const response = await fetch('/api/analyze-audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ musicUrl }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
            }
            const data = await response.json();
            console.log('音频转录结果:', data);
            return data.transcription;
        } catch (error) {
            console.error('音频转录出错:', error);
            throw error;
        }
    },
    getComments: async (url, pages = 1, source = false, cookie = '', token = '') => {
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, pages, source, cookie, token }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取评论时出错:', error);
            throw error;
        }
    }
};

// 辅助函数
function formatDuration(duration) {
    return duration; // 保持原格式，因为后端已经格式化过了
}

function formatDate(dateString) {
    if (!dateString) return '未';
    // 假设 dateString 格式为 "2020-01-22 19:03:42"
    const date = new Date(dateString.replace(' ', 'T')); // 将空格替换为 'T' 以符合 ISO 8601 格式
    if (isNaN(date.getTime())) return '无效日期';
    return date.toLocaleString(); // 或者根据需要自定义格式
}

function parseDuration(duration) {
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else {
        return parts[0];
    }
}

// openaiService
window.openaiService = {
    chatCompletion: async (params) => {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API请求失败: ${errorData.error}\n详情: ${JSON.stringify(errorData.details)}`);
        }
        return await response.json();
    },

    transcribeAudio: async (audioUrl) => {
        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ audioUrl }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.transcription || "无可用转录";
        } catch (error) {
            console.error('转录音频时出错:', error);
            return "转录失败";
        }
    }
};

// 小红书服务
window.xiaohongshuService = {
    searchNotes: async (keyword, page = 1, sort = 'general', noteType = '_0') => {
        try {
            console.log("搜索小红书笔记", keyword, page, sort, noteType);
            const response = await fetch('/api/search_notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keyword, page, sort, noteType }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('搜索小红书笔记时出错:', error);
            throw error;
        }
    },
    getNoteInfo: async (noteId) => {
        try {
            console.log("获取小红书笔记详情", noteId);
            const response = await fetch(`/api/get_note_info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ note_id: noteId }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取小红书笔记详情时出错:', error);
            throw error;
        }
    },
    getNoteComments: async (noteId, lastCursor = '') => {
        try {
            console.log("获取小红书笔记评论", noteId);
            const response = await fetch(`/api/get_note_comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ note_id: noteId, lastCursor }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取小红书笔记评论时出错:', error);
            throw error;
        }
    }
};
