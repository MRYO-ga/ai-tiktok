const axios = require('axios');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { OPEN_AI_KEY, BD_API_KEY, LLM_BASE_URL, USE_HTTPS_AGENT, PROXY_URL } = require('../config');

// 设置代理
const proxyUrl = PROXY_URL; // 请确保这是正确的代理地址和端口
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

// 新增: 用于存储每个接口的token使用情况
const tokenUsage = {
  intentAnalysis: { tokens: 0, cost: 0 },
  searchAgent: { tokens: 0, cost: 0 },
  preGeneratedAnswer: { tokens: 0, cost: 0 },
  finalAnswer: { tokens: 0, cost: 0 },
  whisper: { duration: 0, cost: 0 }, // 新增 Whisper 的使用情况
  total: { tokens: 0, cost: 0 }
};

// 新增: 记录Whisper使用情况的函数
const recordWhisperUsage = (durationInSeconds) => {
  const durationInMinutes = Math.ceil(durationInSeconds / 60); // 向上取整到最近的分钟
  const costPerMinute = 0.006; // Whisper的每分钟成本
  const cost = durationInMinutes * costPerMinute;
  
  tokenUsage.whisper.duration += durationInSeconds;
  tokenUsage.whisper.cost += cost;
  tokenUsage.total.cost += cost;

  console.log('Whisper usage:', {
    duration: durationInSeconds,
    cost: cost.toFixed(8)
  });
  console.log('Total cost including Whisper:', tokenUsage.total.cost.toFixed(8));
};

// 更新: 计算token成本的函数
const calculateCost = (tokens, model) => {
  const rates = {
    'gpt-4o': { input: 0.00500, output: 0.01500 },
    'gpt-4o-2024-05-13': { input: 0.00500, output: 0.01500 },
    'gpt-4': { input: 0.03000, output: 0.06000 },
    'gpt-4-32k': { input: 0.06000, output: 0.12000 },
    'gpt-3.5-turbo-0125': { input: 0.00050, output: 0.00150 },
    'gpt-3.5-turbo-instruct': { input: 0.00150, output: 0.00200 },
    'gpt-4o-mini': { input: 0.00015, output: 0.00060 },
    'gpt-4o-mini-2024-07-18': { input: 0.00015, output: 0.00060 }
  };
  const rate = rates[model] || rates['gpt-3.5-turbo-0125']; // 默认使用最新的 gpt-3.5-turbo 模型价格
  return (tokens.prompt_tokens * rate.input + tokens.completion_tokens * rate.output) / 1000000; // 调整为每百万 tokens 的价格
};

const chatCompletion = async (params) => {
  try {
    const apiKey = LLM_BASE_URL.includes('openai.com') ? OPEN_AI_KEY : BD_API_KEY;
    
    console.log(`Using model: ${params.model}`);
    
    const response = await axiosInstance.post(`${LLM_BASE_URL}/chat/completions`, params, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 计算并记录token使用情况
    const usage = response.data.usage;
    const cost = calculateCost(usage, params.model);
    
    // 根据调用的接口更新相应的token使用情况
    let interfaceType = 'total';
    if (params.messages[0].content.includes('INTENT_PROMPT')) {
      interfaceType = 'intentAnalysis';
    } else if (params.messages[0].content.includes('SEARCH_AGENT')) {
      interfaceType = 'searchAgent';
    } else if (params.messages[1] && params.messages[1].content.includes('根据用户意图生成一个详细全面的答案')) {
      interfaceType = 'preGeneratedAnswer';
    } else if (params.messages[0].content.includes('ANSWER_PROMPT')) {
      interfaceType = 'finalAnswer';
    }

    tokenUsage.total.tokens += usage.total_tokens;
    tokenUsage.total.cost += cost;
    
    console.log('Total token usage:', {
      tokens: tokenUsage.total.tokens,
      cost: tokenUsage.total.cost.toFixed(8) // 8位小数精度应该足够
    });
    
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

// 新增: 重置token使用情况的函数
const resetTokenUsage = () => {
  Object.keys(tokenUsage).forEach(key => {
    if (key === 'whisper') {
      tokenUsage[key] = { duration: 0, cost: 0 };
    } else {
      tokenUsage[key] = { tokens: 0, cost: 0 };
    }
  });
  console.log('Token and Whisper usage reset');
};

module.exports = {
  chatCompletion,
  recordWhisperUsage, // 导出新函数
  resetTokenUsage,
  // 其他导出的函数...
};