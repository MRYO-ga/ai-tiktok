const express = require('express');
const router = express.Router();
const { chatCompletion } = require('../services/openaiService');

router.post('/', async (req, res) => {
  try {
    const result = await chatCompletion(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ error: 'An error occurred during chat completion' });
  }
});

module.exports = router;