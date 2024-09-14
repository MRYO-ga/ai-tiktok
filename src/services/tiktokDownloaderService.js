const axios = require('axios');
const { TIK_TOK_DOWNLOADER_API_URL } = require('../config');
const fs = require('fs').promises;
const path = require('path');

// 基础 API 调用函数
const callApi = async (endpoint, params = {}) => {
    try {
        const response = await axios.get(`${TIK_TOK_DOWNLOADER_API_URL}${endpoint}`, { params });
        return response.data;
    } catch (error) {
        console.error(`调用 API ${endpoint} 时出错:`, error);
        throw error;
    }
};

// 批量下载账号作品 (TikTok)
const downloadUserWorksTikTok = async (username) => {
    return callApi('/download_user_works_tiktok', { username });
};

// 批量下载账号作品 (抖音)
const downloadUserWorksDouyin = async (username) => {
    return callApi('/download_user_works_douyin', { username });
};

// 批量下载链接作品 (通用)
const downloadWorksByLinks = async (links) => {
    return callApi('/download_works_by_links', { links: links.join(',') });
};

// 获取直播推流地址 (抖音)
const getLiveStreamUrl = async (roomId) => {
    return callApi('/get_live_stream_url', { room_id: roomId });
};

// 采集作品评论数据 (抖音)
const getWorkComments = async (workId) => {
    return callApi('/get_work_comments', { work_id: workId });
};

// 批量下载合集作品 (抖音)
const downloadMixWorks = async (mixId) => {
    return callApi('/download_mix_works', { mix_id: mixId });
};

// 批量采集账号数据 (抖音)
const getUserData = async (username) => {
    return callApi('/get_user_data', { username });
};

// 采集搜索结果数据 (抖音)
const getSearchResults = async (keyword, type = '0', pages = '1', sort_type = '0', publish_time = '0') => {
    try {
        const response = await axios.post(`${TIK_TOK_DOWNLOADER_API_URL}/search/`, {
            keyword,
            type,
            pages,
            sort_type,
            publish_time
        });
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            return response.data.data
                .filter(item => {
                    // 过滤掉时长大于2分钟的视频
                    const durationInSeconds = parseDuration(item.duration);
                    return durationInSeconds <= 220; // 2分钟 = 120秒
                })
                .map(item => ({
                    title: item.desc,
                    download_url: item.downloads,
                    cover_image: item.dynamic_cover || item.origin_cover,
                    author: item.nickname,
                    likes: item.digg_count,
                    comments: item.comment_count,
                    shares: item.share_count,
                    duration: item.duration,
                    music_url: item.music_url,
                    create_time: item.create_time
                }));
        } else {
            console.error('意外的响应格式:', response.data);
            return [];
        }
    } catch (error) {
        console.error('获取搜索结果时出错:', error);
        throw error;
    }
};

// 辅助函数：将时长字符串转换为秒数
const parseDuration = (duration) => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else {
        return parts[0];
    }
};

// 获取音频URL
const getAudioUrl = async (downloadUrl) => {
    const response = await axios.get(downloadUrl);
    // 假设响应中包含音频URL,需要根据实际响应格式进行调整
    return response.data.audio_url;
};

// 采集抖音热榜数据 (抖音)
const getHotListData = async () => {
    return callApi('/get_hot_list_data');
};

// 批量下载收藏作品 (抖音)
const downloadFavoriteWorks = async (username) => {
    return callApi('/download_favorite_works', { username });
};

// 下载音频文件
const downloadAudio = async (musicUrl) => {
    try {
        const response = await axios({
            method: 'GET',
            url: musicUrl,
            responseType: 'arraybuffer'
        });

        const tempDir = path.join(__dirname, '..', '..', 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        const fileName = `audio_${Date.now()}.mp3`;
        const filePath = path.join(tempDir, fileName);

        await fs.writeFile(filePath, response.data);
        console.log(`音频文件已下载到: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('下载音频文件时出错:', error);
        throw error;
    }
};

module.exports = {
    downloadUserWorksTikTok,
    downloadUserWorksDouyin,
    downloadWorksByLinks,
    getLiveStreamUrl,
    getWorkComments,
    downloadMixWorks,
    getUserData,
    getSearchResults,
    getHotListData,
    downloadFavoriteWorks,
    getAudioUrl,
    downloadAudio
};