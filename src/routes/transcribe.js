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
    const result = await processTranscription(req.body.transcription);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;