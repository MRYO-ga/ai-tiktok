const axios = require('axios');
const { SELF_API_KEY, BD_LLM_URL } = require('../config');

const chatCompletion = async (body) => {
  try {
    const response = await axios.post(`${BD_LLM_URL}/chat/completions`, body, {
      headers: {
        'Authorization': `Bearer ${SELF_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  chatCompletion
};