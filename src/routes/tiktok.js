const express = require('express');
const router = express.Router();
const tiktokDownloaderService = require('../services/tiktokDownloaderService');
const transcriptionService = require('../services/transcriptionService');
const axios = require('axios');
const xiaohongshuService = require('../services/xiaohongshuService');

router.post('/search', async (req, res) => {
    try {
        const { keyword, type, pages, sort_type, publish_time } = req.body;
        const results = await tiktokDownloaderService.getSearchResults(keyword, type, pages, sort_type, publish_time);
        res.json(results);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json({ error: '搜索过程中出现错误', details: error.response.data });
        } else if (error.request) {
            res.status(error.response?.status || 500).json({ error: '无法连接到 TikTok Downloader API' });
        } else {
            res.status(error.response?.status || 500).json({ error: '搜索过程中出现错误', message: error.message });
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
        res.status(error.response?.status || 500).json({ error: '音频转录过程中出现错误', message: error.message });
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
        res.status(error.response?.status || 500).json({ error: '获取评论时发生错误', message: error.message });
    }
});

module.exports = router;