const express = require('express');
const router = express.Router();
const { chatCompletion } = require('../services/openaiService');

router.post('/', async (req, res, next) => {
  try {
    console.log("收到聊天请求:", JSON.stringify(req.body, null, 2));
    const response = await chatCompletion(req.body);
    console.log("聊天完成，返回响应:", JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error("聊天处理错误:", error);
    if (error.response) {
      console.error("OpenAI API 错误响应:", error.response.data);
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