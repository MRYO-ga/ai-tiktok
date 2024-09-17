require('dotenv').config();

const BD_LLM_URL = process.env.BD_LLM_URL || 'https://api.openai.com';

module.exports = {
  PORT: process.env.PORT || 3001,
  SELF_API_KEY: process.env.SELF_API_KEY,
  OPEN_AI_KEY: process.env.OPEN_AI_KEY,
  BD_LLM_URL,
  BASE_URL: process.env.BASE_URL || 'http://localhost:3001/api',
  TIK_TOK_DOWNLOADER_API_URL: process.env.TIK_TOK_DOWNLOADER_API_URL || 'http://127.0.0.1:5000',
};