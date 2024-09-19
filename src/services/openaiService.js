const axios = require('axios');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { OPEN_AI_KEY, BD_API_KEY, LLM_BASE_URL, USE_HTTPS_AGENT } = require('../config');

// 设置代理
const proxyUrl = 'http://127.0.0.1:7890'; // 请确保这是正确的代理地址和端口
const httpsAgent = new HttpsProxyAgent(proxyUrl);

// 创建 axios 实例
const createAxiosInstance = (url) => {
  if (url.includes('api.openai.com') && USE_HTTPS_AGENT) {
    return axios.create({
      httpsAgent,
      proxy: false
    });
  } else {
    return axios.create();
  }
};

const axiosInstance = createAxiosInstance(LLM_BASE_URL);

const chatCompletion = async (params) => {
  try {
    // console.log(`Sending request to: ${LLM_BASE_URL}/chat/completions`);
    
    const apiKey = LLM_BASE_URL.includes('openai.com') ? OPEN_AI_KEY : BD_API_KEY;
    
    const response = await axiosInstance.post(`${LLM_BASE_URL}/chat/completions`, params, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    // console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error in chat completion:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
    throw error;
  }
};

module.exports = {
  chatCompletion,
  // 其他导出的函数...
};