const express = require('express');
const router = express.Router();
const { chatCompletion } = require('../services/openaiService');

router.post('/chat', async (req, res, next) => {
  try {
    const response = await chatCompletion(req.body);
    res.json(response);
  } catch (error) {
    if (error.response) {
      console.error("OpenAI API 错误状态码:", error.response.status);
      res.status(error.response.status).json({ 
        error: '处理请求时发生错误', 
        details: error.response.data,
      });
    } else {
      res.status(500).json({ 
        error: '处理请求时发生错误', 
        details: error.message,
      });
    }
  }
});

module.exports = router;