const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { convertAndTranscribe, convertAndTranscribeUrl, processTranscription } = require('../services/transcriptionService');

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
  } catch (error) {
    next(error);
  }
});

router.post('/process-transcription', async (req, res, next) => {
  try {
    console.log("收到处理转录请求:", req.body);
    const { transcription } = req.body;
    if (!transcription) {
      return res.status(400).json({ error: '缺少转录文本' });
    }
    const result = await processTranscription(transcription);
    console.log("转录处理完成，返回结果:", result);
    res.json(result);
  } catch (error) {
    console.error("处理转录时出错:", error);
    res.status(500).json({ error: '处理转录时发生错误', details: error.message });
  }
});

module.exports = router;