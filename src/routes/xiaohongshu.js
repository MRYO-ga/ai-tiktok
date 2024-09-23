const express = require('express');
const router = express.Router();
const xiaohongshuService = require('../services/xiaohongshuService');

router.post('/search_notes', async (req, res) => {
    const { keyword, page = 1, sort = 'general', noteType = '_0' } = req.body;

    try {
        const response = await xiaohongshuService.searchNotes(keyword, page, sort, noteType);
        res.json(response);
    } catch (error) {
        res.status(error.response.status || 500).json({ error: '小红书搜索接口调用出错', details: error.message });
    }
});

router.post('/get_note_info', async (req, res) => {
    const { note_id } = req.body;
    try {
      const result = await xiaohongshuService.getNoteInfo(note_id);
      res.json(result);
    } catch (error) {
      res.status(error.response.status || 500).json({ error: '获取小红书笔记详情时出错', message: error.message });
    }
});

router.post('/get_note_comments', async (req, res) => {
    const { note_id, lastCursor } = req.body;

    try {
        const response = await xiaohongshuService.getNoteComments(note_id, lastCursor);
        res.json(response);
    } catch (error) {
        res.status(error.response.status || 500).json({ error: '小红书获取笔记评论接口调用出错', details: error.message });
    }
});

module.exports = router;