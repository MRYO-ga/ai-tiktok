const express = require('express');
const router = express.Router();
const tiktokDownloaderService = require('../services/tiktokDownloaderService');
const transcriptionService = require('../services/transcriptionService');
const axios = require('axios');
const xiaohongshuService = require('../services/xiaohongshuService');

router.post('/search', async (req, res) => {
    try {
        console.log('收到搜索请求:', req.body);
        const { keyword, type, pages, sort_type, publish_time } = req.body;
        const results = await tiktokDownloaderService.getSearchResults(keyword, type, pages, sort_type, publish_time);
        console.log(`搜索结果: ${results.length} 个视频（已过滤时长大于2分钟的视频）`);
        res.json(results);
    } catch (error) {
        console.error('搜索出错:', error);
        if (error.response) {
            console.error('错误响应数据:', error.response.data);
            console.error('错误响应状态:', error.response.status);
            console.error('错误响应头:', error.response.headers);
            res.status(error.response.status).json({ error: '搜索过程中出现错误', details: error.response.data });
        } else if (error.request) {
            console.error('未收到响应:', error.request);
            res.status(500).json({ error: '无法连接到 TikTok Downloader API' });
        } else {
            console.error('错误:', error.message);
            res.status(500).json({ error: '搜索过程中出现错误', message: error.message });
        }
    }
});

router.post('/analyze-audio', async (req, res) => {
    try {
        const { musicUrl } = req.body;
        console.log('收到音频转录请求:', musicUrl);

        // 下载音频文件
        const filePath = await tiktokDownloaderService.downloadAudio(musicUrl);

        // 转录音频文件
        const transcription = await transcriptionService.transcribeAudio(filePath);

        res.json({ transcription });
    } catch (error) {
        console.error('音频转录出错:', error);
        res.status(500).json({ error: '音频转录过程中出现错误', message: error.message });
    }
});

router.post('/comments', async (req, res) => {
    try {
        const { url, pages, source, cookie, token } = req.body;
        if (!url) {
            return res.status(400).json({ error: '缺少 url 参数' });
        }
        const comments = await tiktokDownloaderService.getWorkComments(url, pages, source, cookie, token);
        res.json(comments);
    } catch (error) {
        console.error('获取评论出错:', error);
        res.status(500).json({ error: '获取评论时发生错误', message: error.message });
    }
});

router.post('/api/xiaohongshu/search_notes', async (req, res) => {
    const { keyword, page = 1, sort = 'general', noteType = '_0' } = req.body;

    try {
        const response = await xiaohongshuService.searchNotes(keyword, page, sort, noteType);
        res.json(response);
    } catch (error) {
        console.error('小红书搜索接口调用出错:', error);
        res.status(500).json({ error: '小红书搜索接口调用出错', details: error.message });
    }
});

router.get('/api/xiaohongshu/get_note_info', async (req, res) => {
    const { note_id } = req.query;

    try {
        const response = await xiaohongshuService.getNoteInfo(note_id);
        res.json(response);
    } catch (error) {
        console.error('小红书获取笔记详情接口调用出错:', error);
        res.status(500).json({ error: '小红书获取笔记详情接口调用出错', details: error.message });
    }
});

module.exports = router;