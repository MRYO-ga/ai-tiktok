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
const getWorkComments = async (url, pages = 1, source = false, cookie = '', token = '') => {
    try {
        const response = await axios.post(`${TIK_TOK_DOWNLOADER_API_URL}/comment/`, {
            url,
            pages,
            source,
            cookie,
            token
        });
        // console.log('获取评论:', response.data);
        return response.data;
    } catch (error) {
        console.error('获取评论时出错:', error);
        throw error;
    }
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
        // 模拟搜索结果数据
        const mockSearchResults = [{
            type: '视频',
            collection_time: '2024-09-14 01:01:22',
            uid: '69379628622',
            sec_uid: 'MS4wLjABAAAApbuoECZ31Pbrtl98CKW4cp7Y1Ra2ugZweLt-0sx_5G8',
            unique_id: '',
            short_id: '',
            id: '7413814019988999435',
            desc: '黑神话天兵#黑神话悟空天兵视角 #黑神话悟空',
            text_extra: '黑神话悟空天兵视角, 黑神话悟空',
            duration: '00:00:34',
            ratio: '720p',
            height: 720,
            width: 960,
            share_url: 'https://www.douyin.com/video/7413814019988999435',
            create_time: '2024-09-13 01:45:07',
            uri: 'v0200fg10000crhifqvog65tujfajaug',
            nickname: '奔波儿灞灞波儿奔',
            user_age: -1,
            signature: '',
            downloads: 'http://v3-web.douyinvod.com/45d73dcc4ecef79742a963e517cfb2a1/66e49a31/video/tos/cn/tos-cn-ve-15/osP99AfNCcEQ9KeTA1g6Ipii97FqrzjKBgAZBT/?a=6383&ch=11&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C3&cv=1&br=1339&bt=1339&cs=0&ds=3&ft=AJkeU_TERR0si0C4kDn2Nc0iPMgzbLiBnFsU_4ExKI2JNv7TGW&mime_type=video_mp4&qs=0&rc=ZmU8ZzlpOjxkNGkzZ2U7NkBpamRkbXc5cnRsdTMzNGkzM0BiLjUxLl4yNjYxYmJiNF4zYSNyZ2NyMmRzY2VgLS1kLS9zcw%3D%3D&btag=c0000e00018000&cquery=101n_100B_100x_100z_100o&dy_q=1726246879&feature_id=aa7df520beeae8e397df15f38df0454c&l=2024091401011898EEFFA5D2CF2D395904',
            music_author: '模板创作人',
            music_title: '模板音乐',
            music_url: 'https://sf5-hl-cdn-tos.douyinstatic.com/obj/ies-music/7414030695300909835.mp3',
            origin_cover: 'https://p9-pc-sign.douyinpic.com/tos-cn-p-0015/oYf1KkR6DQPK6j7fATFCEC7rVCfyNTBQEOAbBx~tplv-dy-360p.jpeg?x-expires=1727456400&x-signature=E8hjNsrIPXi%2BiBJkmOGUgdXc6Eg%3D&from=327834062&s=PackSourceEnum_SEARCH&se=false&sc=origin_cover&biz_tag=pcweb_cover&l=2024091401011898EEFFA5D2CF2D395904',
            dynamic_cover: 'https://p9-pc-sign.douyinpic.com/obj/tos-cn-p-0015/ogKAMi9BgqkB6PpifnzeABA9I9jNKcIrZ1TDNC?x-expires=1727456400&x-signature=7DAWSS%2B9QYAFy60AZPQjdQyuMkI%3D&from=327834062_large&s=PackSourceEnum_SEARCH&se=false&sc=dynamic_cover&biz_tag=pcweb_cover&l=2024091401011898EEFFA5D2CF2D395904',
            // tag_1: '',
            // tag_2: '',
            // tag_3: '',
            digg_count: 22995,
            comment_count: 1838,
            collect_count: 1709,
            share_count: 7432
        }];

        // 直接返回模拟数据
        return mockSearchResults;
        const response = await axios.get(`${BASE_URL}/api/tiktok/search`, {
            params: { keyword }
        });
        
        return response.data.map(item => ({
            type: item.type || '',
            collection_time: new Date().toISOString(), // 当前时间作为采集时间
            uid: item.uid || '',
            sec_uid: item.sec_uid || '',
            unique_id: item.unique_id || '',
            short_id: item.short_id || '',
            id: item.id || '',
            desc: item.desc || '',
            text_extra: item.text_extra || '',
            duration: item.duration || '',
            ratio: item.ratio || '',
            height: item.height || 0,
            width: item.width || 0,
            share_url: item.share_url || '',
            create_time: item.create_time || '',
            uri: item.uri || '',
            nickname: item.nickname || '',
            user_age: item.user_age || 0,
            signature: item.signature || '',
            downloads: item.downloads || '',
            music_author: item.music_author || '',
            music_title: item.music_title || '',
            music_url: item.music_url || '',
            origin_cover: item.origin_cover || '',
            dynamic_cover: item.dynamic_cover || '',
            tag_1: item.tag_1 || '',
            tag_2: item.tag_2 || '',
            tag_3: item.tag_3 || '',
            digg_count: item.digg_count || 0,
            comment_count: item.comment_count || 0,
            collect_count: item.collect_count || 0,
            share_count: item.share_count || 0,
            extra: item.extra || ''
        }));
    } catch (error) {
        console.error('Error fetching search results:', error);
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