require('dotenv').config();

const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://api.openai.com';

module.exports = {
  PORT: process.env.PORT || 3001,
  BD_API_KEY: process.env.BD_API_KEY,
  OPEN_AI_KEY: process.env.OPEN_AI_KEY,
  LLM_BASE_URL,
  BASE_URL: process.env.BASE_URL || 'http://localhost:3001/api',
  TIK_TOK_DOWNLOADER_API_URL: process.env.TIK_TOK_DOWNLOADER_API_URL || 'http://127.0.0.1:5000',
  USE_HTTPS_AGENT: process.env.USE_HTTPS_AGENT === 'true'
};