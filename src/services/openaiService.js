const axios = require('axios');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { OPEN_AI_KEY, BD_LLM_URL } = require('../config');

// 设置代理
const proxyUrl = 'http://127.0.0.1:7890'; // 请确保这是正确的代理地址和端口
const httpsAgent = new HttpsProxyAgent(proxyUrl);

// 创建 axios 实例
const createAxiosInstance = (url) => {
  if (url.includes('api.openai.com')) {
    return axios.create({
      httpsAgent,
      proxy: false
    });
  } else {
    return axios.create();
  }
};

const axiosInstance = createAxiosInstance(BD_LLM_URL);

const chatCompletion = async (params) => {
  try {
    // console.log(`Sending request to: ${BD_LLM_URL}/chat/completions`);
    // console.log('Request params:', JSON.stringify(params, null, 2));
    
    const response = await axiosInstance.post(`${BD_LLM_URL}/chat/completions`, params, {
      headers: {
        'Authorization': `Bearer ${OPEN_AI_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // console.log('Response status:', response.status);
    // console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error in chat completion:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
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