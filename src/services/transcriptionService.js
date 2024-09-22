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
const { OPEN_AI_KEY, BD_API_KEY, LLM_BASE_URL, BASE_URL, USE_HTTPS_AGENT, PROXY_URL } = require('../config');
const { recordWhisperUsage } = require('./openaiService');

// 设置代理
const proxyUrl = PROXY_URL; // 使用环境变量中的代理地址
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
const transcribeAudio = async (audioUrl) => {
  const axiosInstance = createAxiosInstance(LLM_BASE_URL);
  try {
    console.log('开始下载音频文件');
    const audioResponse = await axiosInstance.get(audioUrl, { 
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
      }
    });
    const audioBuffer = Buffer.from(audioResponse.data);
    console.log('音频文件下载完成，大小:', (audioBuffer.length / 1024).toFixed(2), 'KB');

    const formData = new FormData();
    formData.append('file', audioBuffer, { 
      filename: 'audio',
      contentType: audioResponse.headers['content-type'] || 'audio/mpeg'
    });
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');

    console.log('准备发送请求到 Whisper API');
    const whisperResponse = await axiosInstance.post(`https://api.openai.com/v1/audio/transcriptions`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${OPEN_AI_KEY}`,
      },
    });

    console.log('收到Whisper API响应');
    const segments = whisperResponse.data.segments.map(segment => ({
      start: Number(segment.start.toFixed(2)),
      end: Number(segment.end.toFixed(2)),
      text: segment.text
    }));

    console.log(`分段数量: ${segments.length}`);

    const paragraphs = combineSegmentsIntoParagraphs(segments);
    console.log(`段落数量: ${paragraphs.length}`);

    // 计算音频总时长
    const totalDuration = segments.reduce((acc, segment) => Math.max(acc, segment.end), 0);
    
    // 记录Whisper使用情况
    await recordWhisperUsage(totalDuration);

    return {
      text: whisperResponse.data.text,
      paragraphs: paragraphs
    };
    // 模拟分段输出
    const simulateSegmentedOutput = () => {
      return [
        {
          end: 28.84,
          start: 0.00,
          text: "两个人出国去趟澳大利亚 到底需要多少钱 价格我放最后了 11天时间打卡悉尼 凯恩斯 黄金海岸 墨尔本 体验出海观景 大洋路自驾 外宝交付钱 直接落地悉尼 开启Citywalk 打卡地标建筑歌剧院 闯入魔法学院悉尼大学 参观庄严的圣玛丽大教堂 再去感受下艺术的薰操 南半球最美火车站 当然也不能错过 搭乘游船出海杰维斯湾"
        },
        {
          end: 58.52,
          start: 28.84,
          text: "邂逅调皮小海豚 亲眼见证庞然巨物跃出海面 去打卡海崖大桥 人生赵家一 转战凯恩斯 游览古老神秘的热带云 乘坐水陆两用车探险 感受原住民文化 参观库牛农场 与动物们来一场亲密接触 接着来到本次行程的重头戏 乘坐豪华游轮出海外宝礁 欣赏瑰丽的珊瑚礁群 潜入绚烂海底世界 邂逅丰富的海洋生物 再闪现布里斯班"
        },
        {
          end: 87.96,
          start: 58.52,
          text: "去感受阳光之城的松驰 去看世界最长的海岸线 去打卡冲浪者天堂 去电影世界看花车巡游 最后去到浪漫之都墨尔本 逛逛南半球最大的露天市场 去满腹活力的涂鸦街 去浪漫的皇家植物园 傍晚去到菲利普岛 看可爱的企鹅归巢 最后的行程安排大洋路自驾 沿岸都是绝景奇观 夕阳下的十二史图檐 仿佛进入异域世界 最后墨尔本市区买买纪念品"
        },
        {
          end: 94.64,
          start: 88.52,
          text: "结束行程 这样的十一天四程之旅 人均只要两万多 你肯定心动了吧"
        }
      ];
    };

    // 模拟分段输出
    const simulatedParagraphs = simulateSegmentedOutput();
    console.log(`模拟段落数量: ${simulatedParagraphs.length}`);

    const fullText = simulatedParagraphs.map(p => p.text).join(' ');

    return {
      text: fullText,
      paragraphs: simulatedParagraphs,
    };



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
    const response = await createAxiosInstance(LLM_BASE_URL).post(`${LLM_BASE_URL}/v1/audio/transcriptions`, formData, {
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

    // 计算音频总时长
    const totalDuration = segments.reduce((acc, segment) => Math.max(acc, segment.end), 0);
    
    // 记录Whisper使用情况
    await recordWhisperUsage(totalDuration);

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

    // 计算音频总时长
    const totalDuration = segments.reduce((acc, segment) => Math.max(acc, segment.end), 0);
    
    // 记录Whisper使用情况
    await recordWhisperUsage(totalDuration);

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
  const axiosInstance = createAxiosInstance(LLM_BASE_URL);
  console.log('开始处理转录文本');
  console.log(`转录文本长度: ${transcription.length}`);

  console.log('请求摘要...');
  const summaryResponse = await axiosInstance.post(`${LLM_BASE_URL}/chat/completions`, {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "你是一个视频内容总结助手。请简洁地总结以下内容。500个tokens以内" },
      { role: "user", content: transcription }
    ],
    max_tokens: 500
  }, {
    headers: {
      'Authorization': `Bearer ${BD_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const summary = summaryResponse.data.choices[0].message.content;
  console.log(`摘要长度: ${summary.length}`);

  console.log('请求预处理...');
  const preprocessResponse = await axiosInstance.post(`${LLM_BASE_URL}/chat/completions`, {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "你是一个文本处理助手。请对以下文本进行处理：1、去除冗余的话（文章的举例千万不要去除，可以进行适当总结），2、保留原文的举例，3、保留因果关系的论证，4、保持好原文的推理逻辑，（因为、所以）5、去除人称视角 6、注意错别字和不通顺的句子（酌情修改）。同时，请标记出重要句子，用 <important> 标签包裹。" },
      { role: "user", content: transcription }
    ],
    max_tokens: 2000
  }, {
    headers: {
      'Authorization': `Bearer ${BD_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const preprocessed = preprocessResponse.data.choices[0].message.content;
  console.log(`预处理后文本长度: ${preprocessed.length}`);

  return { summary, preprocessed };
};

const combineSegmentsIntoParagraphs = (segments, maxParagraphDuration = 30, maxCharacters = 100) => {
  console.log('开始合并段落');
  console.log(`输入段落数: ${segments.length}`);
  console.log(`最大段落持续时间: ${maxParagraphDuration}秒`);
  console.log(`最大段落字数: ${maxCharacters}字`);

  const paragraphs = [];
  let currentParagraph = { start: 0, end: 0, text: '' };

  segments.forEach((segment, index) => {
    if (currentParagraph.text === '' || 
        (segment.start - currentParagraph.end) < 2 && 
        (segment.end - currentParagraph.start) < maxParagraphDuration &&
        (currentParagraph.text.length + segment.text.length) <= maxCharacters) {
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