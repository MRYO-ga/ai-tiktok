require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  SELF_API_KEY: process.env.SELF_API_KEY,
  OPEN_AI_KEY: process.env.OPEN_AI_KEY,
  BD_LLM_URL: process.env.BD_LLM_URL,
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000/api'  // 添加这行
};