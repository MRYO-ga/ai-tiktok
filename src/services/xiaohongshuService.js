const axios = require('axios');
const { XIAOHONGSHU_URL, XIAOHONGSHU_KEY } = require('../config');

const searchNotes = async (keyword, page = 1, sort = 'general', noteType = '_0') => {
    const API_URL = `https://api.tikhub.io/api/v1/xiaohongshu/web/search_notes`;
    const API_TOKEN = XIAOHONGSHU_KEY;

    try {
        const response = await axios.get(API_URL, {
            params: {
                keyword,
                page,
                sort,
                noteType
            },
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'accept': 'application/json'
            }
        });
        if (typeof response.data === 'string') {
            return JSON.parse(response.data);
        }
        return response.data;
    } catch (error) {
        console.error('小红书搜索接口调用出错:', error);
        if (error.response) {
            console.error('错误响应数据:', error.response.data);
            console.error('错误响应状态:', error.response.status);
            console.error('错误响应头:', error.response.headers);
        } else if (error.request) {
            console.error('未收到响应:', error.request);
        } else {
            console.error('错误:', error.message);
        }
        throw error;
    }
};

const getNoteInfo = async (noteId) => {
    const API_URL = `https://api.tikhub.io/api/v1/xiaohongshu/web/get_note_info`;
    const API_TOKEN = XIAOHONGSHU_KEY;

    try {
        const response = await axios.get(API_URL, {
            params: {
                note_id: noteId
            },
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'accept': 'application/json'
            }
        });
        if (typeof response.data === 'string') {
            return JSON.parse(response.data);
        }
        return response.data;
    } catch (error) {
        console.error('小红书获取笔记详情接口调用出错:', error);
        if (error.response) {
            console.error('错误响应数据:', error.response.data);
            console.error('错误响应状态:', error.response.status);
            console.error('错误响应头:', error.response.headers);
        } else if (error.request) {
            console.error('未收到响应:', error.request);
        } else {
            console.error('错误:', error.message);
        }
        throw error;
    }
};

module.exports = {
    searchNotes,
    getNoteInfo
};