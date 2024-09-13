const axios = require('axios');
const { SELF_API_KEY, BASE_URL } = require('../config');

const chatCompletion = async (body) => {
  console.log("准备发送请求到OpenAI:", JSON.stringify(body, null, 2));
  try {
    const response = await axios.post(`${BASE_URL}/chat/completions`, body, {
      headers: {
        'Authorization': `Bearer ${SELF_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("收到OpenAI响应:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("OpenAI请求错误:", error.message);
    if (error.response) {
      console.error("OpenAI API 错误响应:", error.response.data);
      console.error("OpenAI API 错误状态码:", error.response.status);
    } else if (error.request) {
      console.error("未收到响应:", error.request);
    } else {
      console.error("请求设置时出错:", error.message);
    }
    throw error;
  }
};

module.exports = {
  chatCompletion
};