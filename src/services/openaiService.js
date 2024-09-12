const axios = require('axios');
const { SELF_API_KEY, BASE_URL } = require('../config');

const makeRequestWithRetry = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await axios(url, options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};

const chatCompletion = async (body) => {
  const response = await makeRequestWithRetry(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SELF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    data: body
  });
  return response.data;
};

module.exports = {
  chatCompletion,
  makeRequestWithRetry
};