const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { convertAndTranscribe, convertAndTranscribeUrl, processTranscription } = require('../services/transcriptionService');
const { BASE_URL } = require('../config');  // 添加这行
const transcriptionService = require('../services/transcriptionService');
const xiaohongshuService = require('../services/xiaohongshuService');

router.post('/convert-and-transcribe', upload.single('file'), async (req, res, next) => {
  try {
    const result = await convertAndTranscribe(req.file);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/convert-and-transcribe-url', async (req, res, next) => {
  try {
    const result = await convertAndTranscribeUrl(req.body.url);
    res.json(result);
    // 暂时返回模拟数据
    // const mockTranscription = {
    //   text: "这是一个模拟的视频转录文本。实际应用中,这里会是真实的视频内容转录。",
    //   paragraphs: [
    //     { start: 0, end: 5, text: "这是一个模拟的视频转录文本。" },
    //     { start: 5, end: 10, text: "实际应用中,这里会是真实的视频内容转录。" }
    //   ]
    // };
    // res.json(mockTranscription);
  } catch (error) {
    next(error);
  }
});

router.post('/process-transcription', async (req, res, next) => {
  try {
    const { transcription } = req.body;
    if (!transcription) {
      return res.status(400).json({ error: '缺少转录文本' });
    }
    const result = await processTranscription(transcription);
    console.log("转录处理完成，返回结果:", result);
    res.json(result);
  } catch (error) {
    res.status(error.response.status || 500).json({ error: '处理转录时发生错误', details: error.message });
  }
});

router.post('/transcribe', async (req, res) => {
  try {
    const { audioUrl } = req.body;
    // 判断 audioUrl 是否为空或格式不正确
    if (!audioUrl || typeof audioUrl !== 'string' || !audioUrl.trim()) {
      throw new Error('音频 URL 不能为空且必须是有效的字符串');
    }
  
    // 简单的 URL 格式验证
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(audioUrl)) {
      throw new Error('无效的音频 URL 格式');
    }
    console.log('收到转录请求，音频 URL:', audioUrl);
    const transcription = await transcriptionService.transcribeAudio(audioUrl);
    console.log('转录完成');
    res.json({ transcription });
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({ 
        error: '转录过程中出现错误', 
        message: error.response.data.error || error.message,
        details: error.response.data
      });
    } else {
      res.status(error.response.status || 500).json({ error: '转录过程中出现错误', message: error.message });
    }
  }
});

module.exports = router;