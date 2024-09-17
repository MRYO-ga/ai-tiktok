const axios = require('axios');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const FormData = require('form-data');
const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const puppeteer = require('puppeteer');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);
const { OPEN_AI_KEY, SELF_API_KEY, BD_LLM_URL, BASE_URL } = require('../config');

// 设置代理
const proxyUrl = 'http://127.0.0.1:7897'; // 请确保这是正确的代理地址和端口
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

const transcribeAudio = async (audioUrl) => {
  const axiosInstance = createAxiosInstance(BD_LLM_URL);
  try {
    // 模拟转录结果
    console.log('模拟音频转录过程');
    const mockTranscription = `为什么黑神话里等级上限不是一百级而是三百四十二级？因为孙悟空只活到了三百四十二岁。而伤害上限为什么是十万八千？因为对应的数据等于十万八千。五十四个惊魄加十个变身加八个法术，也刚刚好等于七十二变。而国外玩家都以为八戒只是只宠物，只有国人才懂他每字每句有多抽心。"你是哪里来的鱼人？哪里来的生人？你这嘴脸生的各样，上脑有些雷堆。这是别处来的妖魔，瞧你的长嘴模样，我看就不像是好人。""才分开几天，你就不认得人了？原来是八戒，哥哥。"还有在打抗金龙时的那个庙是不是似曾相识？因为跟猴哥在电视剧和动画里变得一模一样。有时我都觉得玩的不仅仅是一个游戏，更多的是我们童年的回忆。`;
    
    return mockTranscription;
    console.log('开始下载音频文件:', audioUrl);
    const audioResponse = await axiosInstance.get(audioUrl, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(audioResponse.data);
    console.log('音频文件下载完成，大小:', audioBuffer.length, '字节');

    const formData = new FormData();
    formData.append('file', audioBuffer, { filename: 'audio.mp3', contentType: 'audio/mpeg' });
    formData.append('model', 'whisper-1');

    console.log('准备发送请求到 Whisper API');
    const whisperResponse = await axiosInstance.post(`${BD_LLM_URL}/audio/transcriptions`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${OPEN_AI_KEY}`,
      },
    });

    console.log('Whisper API 响应状态:', whisperResponse.status);
    return whisperResponse.data.text || "该音频没有可识别的语音内容";
  } catch (error) {
    console.error('音频转录出错:', error);
    if (error.response) {
      console.error('错误响应状态:', error.response.status);
      console.error('错误响应数据:', error.response.data);
    } else if (error.request) {
      console.error('未收到响应:', error.request);
    } else {
      console.error('错误信息:', error.message);
    }
    throw error;
  }
};

const convertAndTranscribe = async (file) => {
  // 直接返回响应内容
  console.log('开始转换和转录过程');
  let inputPath, outputPath;
  try {
    inputPath = path.join(__dirname, '../../temp_input.mp4');
    outputPath = path.join(__dirname, '../../temp_output.mp3');

    console.log(`输入文件路径: ${inputPath}`);
    console.log(`输出文件路径: ${outputPath}`);

    await fs.writeFile(inputPath, file.buffer);
    console.log('文件已写入临时输入路径');

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate(64)
        .on('end', () => {
          console.log('音频转换完成');
          resolve();
        })
        .on('error', (err) => {
          console.error('音频转换错误:', err);
          reject(err);
        })
        .save(outputPath);
    });

    const audioBuffer = await fs.readFile(outputPath);
    console.log(`音频文件大小: ${audioBuffer.length} 字节`);

    const formData = new FormData();
    formData.append('file', audioBuffer, { filename: 'audio.mp3' });
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');

    console.log('准备发送转录请求到OpenAI');
    const response = await createAxiosInstance(BD_LLM_URL).post(`${BD_LLM_URL}/v1/audio/transcriptions`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${OPEN_AI_KEY}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('收到OpenAI响应');
    const segments = response.data.segments.map(segment => ({
      start: segment.start,
      end: segment.end,
      text: segment.text
    }));

    console.log(`分段数量: ${segments.length}`);

    const paragraphs = combineSegmentsIntoParagraphs(segments);
    console.log(`段落数量: ${paragraphs.length}`);

    return {
      text: response.data.text,
      paragraphs: paragraphs
    };
  } catch (error) {
    console.error('转换和转录过程中出错:', error);
    throw error;
  } finally {
    if (inputPath) {
      try {
        await fs.unlink(inputPath);
      } catch (err) {
        console.log('无法删除输入文件', err);
      }
    }
    if (outputPath) {
      try {
        await fs.unlink(outputPath);
      } catch (err) {
        console.log('无法删除输出文件', err);
      }
    }
  }
};

const convertAndTranscribeUrl = async (url) => {
  console.log(`开始处理URL: ${url}`);
  let inputPath, outputPath;
  try {
    const browser = await puppeteer.launch({
      headless: "new"
    });
    const page = await browser.newPage();
    
    await page.setViewport({
      width: 375,
      height: 667,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });

    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');

    console.log('正在加载页面...');
    await page.goto(url, { waitUntil: 'networkidle0' });

    console.log('等待视频元素加载...');
    await page.waitForSelector('video', { timeout: 5000 });

    const videoSrc = await page.evaluate(() => {
      const videoElement = document.querySelector('video');
      return videoElement ? videoElement.src : null;
    });

    await browser.close();
    console.log('浏览器已关闭');

    if (!videoSrc) {
      throw new Error('未找视频源');
    }

    console.log(`找到视频源: ${videoSrc}`);

    inputPath = path.join(__dirname, '../../temp_input.mp4');
    outputPath = path.join(__dirname, '../../temp_output.mp3');

    console.log('开始下载视频...');
    const videoResponse = await createAxiosInstance(videoSrc).get(videoSrc, { responseType: 'stream' });

    await pipeline(videoResponse.data, fs.createWriteStream(inputPath));
    console.log('视频下载完成');

    console.log('开始转换音频...');
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate(128)
        .on('end', () => {
          console.log('音频转换完成');
          resolve();
        })
        .on('error', (err) => {
          console.error('音频转换错误:', err);
          reject(err);
        })
        .save(outputPath);
    });

    const audioBuffer = await fs.readFile(outputPath);
    console.log(`音频文件大小: ${audioBuffer.length} 字节`);

    const formData = new FormData();
    formData.append('file', audioBuffer, { filename: 'audio.mp3' });
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');

    console.log('准备发送转录请求到OpenAI');
    const response = await createAxiosInstance("https://api.openai.com").post(`https://api.openai.com/v1/audio/transcriptions`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${OPEN_AI_KEY}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('收到OpenAI响应');
    const segments = response.data.segments.map(segment => ({
      start: segment.start,
      end: segment.end,
      text: segment.text
    }));

    console.log(`分段数量: ${segments.length}`);

    const paragraphs = combineSegmentsIntoParagraphs(segments);
    console.log(`段落数量: ${paragraphs.length}`);

    return {
      text: response.data.text,
      paragraphs: paragraphs
    };
  } catch (error) {
    console.error('URL处理过程中出错:', error);
    throw error;
  } finally {
    // 清理临时文件
    if (inputPath) {
      try {
        await fs.unlink(inputPath);
      } catch (err) {
        console.log('无法删除输入文件', err);
      }
    }
    if (outputPath) {
      try {
        await fs.unlink(outputPath);
      } catch (err) {
        console.log('无法删除输出文件', err);
      }
    }
  }
};

const processTranscription = async (transcription) => {
  const axiosInstance = createAxiosInstance(BD_LLM_URL);
  console.log('开始处理转录文本');
  console.log(`转录文本长度: ${transcription.length}`);

  console.log('请求摘要...');
  const summaryResponse = await axiosInstance.post(`${BD_LLM_URL}/chat/completions`, {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "你是一个视频内容总结助手。请简洁地总结以下内容。500个tokens以内" },
      { role: "user", content: transcription }
    ],
    max_tokens: 500
  }, {
    headers: {
      'Authorization': `Bearer ${SELF_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const summary = summaryResponse.data.choices[0].message.content;
  console.log(`摘要长度: ${summary.length}`);

  console.log('请求预处理...');
  const preprocessResponse = await axiosInstance.post(`${BD_LLM_URL}/chat/completions`, {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "你是一个文本处理助手。请对以下文本进行处理：1、去除冗余的话（文章的举例千万不要去除，可以进行适当总结），2、保留原文的举例，3、保留因果关系的论证，4、保持好原文的推理逻辑，（因为、所以）5、去除人称视角 6、注意错别字和不通顺的句子（酌情修改）。同时，请标记出重要句子，用 <important> 标签包裹。" },
      { role: "user", content: transcription }
    ],
    max_tokens: 2000
  }, {
    headers: {
      'Authorization': `Bearer ${SELF_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const preprocessed = preprocessResponse.data.choices[0].message.content;
  console.log(`预处理后文本长度: ${preprocessed.length}`);

  return { summary, preprocessed };
};

const combineSegmentsIntoParagraphs = (segments, maxParagraphDuration = 30) => {
  console.log('开始合并段落');
  console.log(`输入段落数: ${segments.length}`);
  console.log(`最大段落持续时间: ${maxParagraphDuration}秒`);

  const paragraphs = [];
  let currentParagraph = { start: 0, end: 0, text: '' };

  segments.forEach((segment, index) => {
    if (currentParagraph.text === '' || 
        (segment.start - currentParagraph.end) < 2 && 
        (segment.end - currentParagraph.start) < maxParagraphDuration) {
      currentParagraph.end = segment.end;
      currentParagraph.text += (currentParagraph.text ? ' ' : '') + segment.text;
    } else {
      paragraphs.push({ ...currentParagraph });
      currentParagraph = { start: segment.start, end: segment.end, text: segment.text };
    }

    if (index === segments.length - 1) {
      paragraphs.push({ ...currentParagraph });
    }
  });

  console.log(`输出段落数: ${paragraphs.length}`);
  return paragraphs;
};

module.exports = {
  transcribeAudio,
  convertAndTranscribe,
  convertAndTranscribeUrl,
  processTranscription,
  combineSegmentsIntoParagraphs
};