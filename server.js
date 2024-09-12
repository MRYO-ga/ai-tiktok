process.removeAllListeners('warning');

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const multer = require('multer');
const upload = multer();
const CryptoJS = require('crypto-js');
const FormData = require('form-data');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

// 添加一个简单的计时函数
const timer = (start) => {
    if (!start) return process.hrtime();
    const end = process.hrtime(start);
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
};

function generateSignature(apiKey, apiSecret) {
    const ts = Math.floor(Date.now() / 1000).toString();
    const baseString = apiKey + ts;
    const md5 = CryptoJS.MD5(baseString).toString();
    const signa = CryptoJS.HmacSHA1(md5, apiSecret).toString(CryptoJS.enc.Base64);
    return { signa, ts };
}

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SELF_API_KEY = process.env.SELF_API_KEY;
const OPEN_AI_KEY = process.env.OPEN_AI_KEY;
const BASE_URL = process.env.BASE_URL;

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

// 设置全局超时
axios.defaults.timeout = 300000; // 5分钟

// 在需要重试的请求中添加重试逻辑
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

app.post('/api/chat', async (req, res) => {
    const cacheKey = JSON.stringify(req.body);
    const cachedResponse = myCache.get(cacheKey);
    
    if (cachedResponse) {
        return res.json(cachedResponse);
    }

    console.log('Received request:', req.body.messages);
    try {
        console.log('Sending request to OpenAI API...');
        const response = await makeRequestWithRetry(`${BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SELF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          data: req.body
        });
        console.log('API response:', response.data);
        myCache.set(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Full error object:', error);
        console.error('Error response:', error.response ? error.response.data : 'No response');
        console.error('Error request:', error.request ? error.request : 'No request');
        console.error('Error config:', error.config);
        res.status(error.response ? error.response.status : 500).json({
            error: 'An error occurred while processing your request.',
            details: error.response ? error.response.data : error.message,
            status: error.response ? error.response.status : 500,
            config: error.config
        });
    }
});

app.post('/api/convert-and-transcribe', upload.single('file'), async (req, res) => {
    const startTime = timer();
    console.log('开始处理 convert-and-transcribe 请求');
    if (!req.file) {
        console.log('错误: 没有上传文件');
        return res.status(400).json({ error: '没有上传文件' });
    }
    
    let response;
    let inputPath, outputPath;
    try {
        inputPath = path.join(__dirname, 'temp_input.mp4');
        outputPath = path.join(__dirname, 'temp_output.mp3');

        console.log('正在写入临时输入文件:', inputPath);
        console.log('文件大小:', req.file.size, 'bytes');
        await fsPromises.writeFile(inputPath, req.file.buffer);
        console.log('临时输入文件写入完成, 耗时:', timer(startTime), 'ms');

        const convertStartTime = timer();
        console.log('开始转换视频为音频');
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .noVideo()
                .audioCodec('libmp3lame')
                .audioBitrate(64)
                .on('progress', (progress) => {
                    console.log(`处理进度: ${progress.percent}%`);
                })
                .on('end', () => {
                    console.log('视频转换为音频完成');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('ffmpeg 错误:', err);
                    reject(err);
                })
                .save(outputPath);
        });
        console.log('视频转换为音频完成, 耗时:', timer(convertStartTime), 'ms');

        const readStartTime = timer();
        console.log('正在读取音频文件');
        const audioBuffer = await fsPromises.readFile(outputPath);
        console.log('音频文件读取完成, 大小:', audioBuffer.length, 'bytes, 耗时:', timer(readStartTime), 'ms');

        const formData = new FormData();
        formData.append('file', audioBuffer, { filename: 'audio.mp3' });
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'verbose_json');

        const transcribeStartTime = timer();
        console.log('开始调用OpenAI API进行转录');
        console.log('请求头:', formData.getHeaders());
        console.log('音频文件大小:', audioBuffer.length, 'bytes');
        response = await makeRequestWithRetry('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${OPEN_AI_KEY}`,
            },
            data: formData,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 300000 // 5分钟超时
        });
        console.log('OpenAI API转录完成, 耗时:', timer(transcribeStartTime), 'ms');

        console.log('正在删除临时文件');
        await fsPromises.unlink(inputPath);
        await fsPromises.unlink(outputPath);
        console.log('临时文件删除完成');

        const segments = response.data.segments.map(segment => ({
          start: segment.start,
          end: segment.end,
          text: segment.text
        }));

        const paragraphs = combineSegmentsIntoParagraphs(segments);

        console.log('转录结果长度:', response.data.text.length, '字符');
        console.log('总耗时:', timer(startTime), 'ms');
        res.json({
          text: response.data.text,
          paragraphs: paragraphs
        });
    } catch (error) {
        console.error('转换和转录错误:', error);
        console.error('错误堆栈:', error.stack);
        console.error('错误发生时总耗时:', timer(startTime), 'ms');
        res.status(500).json({
            error: '转换和转录过程中出错',
            details: error.message,
            stack: error.stack
        });
    } finally {
        // 确保清理临时文件
        try {
            if (inputPath && fs.existsSync(inputPath)) await fsPromises.unlink(inputPath);
            if (outputPath && fs.existsSync(outputPath)) await fsPromises.unlink(outputPath);
            console.log('临时文件清理完成');
        } catch (cleanupError) {
            console.error('清理临时文件时出错:', cleanupError);
        }
    }
});

app.post('/api/convert-and-transcribe-url', async (req, res) => {
    const startTime = timer();
    const { url } = req.body;
    if (!url) {
        console.log('错误: 没有提供URL');
        return res.status(400).json({ error: '没有提供URL' });
    }
    
    let inputPath, outputPath;
    try {
        console.log('开始处理视频URL:', url);

        // 使用 Puppeteer 打开页面
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // 设置移动设备模拟
        await page.setViewport({
            width: 375,
            height: 667,
            deviceScaleFactor: 1,
            isMobile: true,
            hasTouch: true,
        });

        // 设置 User-Agent
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');

        await page.goto(url, { waitUntil: 'networkidle0' });

        // 等待视频元素加载
        await page.waitForSelector('video', { timeout: 5000 });

        // 获取视频 URL
        const videoSrc = await page.evaluate(() => {
            const videoElement = document.querySelector('video');
            return videoElement ? videoElement.src : null;
        });

        await browser.close();

        if (!videoSrc) {
            throw new Error('未找到视频源');
        }

        console.log('找到视频源:', videoSrc);

        // 下载视频
        inputPath = path.join(__dirname, 'temp_input.mp4');
        outputPath = path.join(__dirname, 'temp_output.mp3');

        console.log('开始下载视频');
        const videoResponse = await axios({
            method: 'get',
            url: videoSrc,
            responseType: 'stream'
        });

        await pipeline(
          videoResponse.data,
          fs.createWriteStream(inputPath)
        );
        console.log('视频下载完成');

        console.log('开始转换视频为音频');
        const convertStartTime = timer();
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .noVideo()
                .audioCodec('libmp3lame')
                .audioBitrate(128)
                .on('progress', (progress) => {
                    console.log(`处理进度: ${progress.percent}%`);
                })
                .on('end', () => {
                    console.log('视频转换为音频完成');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('ffmpeg 错误:', err);
                    reject(err);
                })
                .save(outputPath);
        });
        console.log('视频转换为音频完成, 耗时:', timer(convertStartTime), 'ms');

        console.log('开始读取音频文件');
        const audioBuffer = await fsPromises.readFile(outputPath);
        console.log('音频文件读取完成, 大小:', audioBuffer.length, 'bytes');

        const formData = new FormData();
        formData.append('file', audioBuffer, { filename: 'audio.mp3' });
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'verbose_json');

        console.log('开始调用OpenAI API进行转录');
        console.log('请求头:', formData.getHeaders());
        console.log('音频文件大小:', audioBuffer.length, 'bytes');
        try {
          const response = await makeRequestWithRetry('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              ...formData.getHeaders(),
              'Authorization': `Bearer ${OPEN_AI_KEY}`,
            },
            data: formData,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 300000 // 5分钟超时
          });
          console.log('OpenAI API转录完成, 耗时:', timer(transcribeStartTime), 'ms');
          // ... 处理响应 ...
        } catch (error) {
          console.error('OpenAI API调用失败:', error.message);
          if (error.response) {
            console.error('错误响应:', error.response.data);
            console.error('错误状态:', error.response.status);
          }
          throw error; // 重新抛出错误，让外层catch捕获
        }

        await fsPromises.unlink(inputPath);
        await fsPromises.unlink(outputPath);
        console.log('临时文件删除完成');

        const segments = response.data.segments.map(segment => ({
          start: segment.start,
          end: segment.end,
          text: segment.text
        }));

        const paragraphs = combineSegmentsIntoParagraphs(segments);

        console.log('转录结果长度:', response.data.text.length, '字符');
        console.log('总耗时:', timer(startTime), 'ms');
        res.json({
          text: response.data.text,
          paragraphs: paragraphs
        });
    } catch (error) {
        console.error('URL转换和转录错误:', error.message);
        console.error('错误发生时总耗时:', timer(startTime), 'ms');
        
        let statusCode = 500;
        let errorMessage = 'URL转换和转录过程中出错';
        
        if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET') {
          statusCode = 503;
          errorMessage = '服务暂时不可用，请稍后重试';
        } else if (error.response && error.response.status === 429) {
          statusCode = 429;
          errorMessage = '请求过于频繁，请稍后重试';
        }
        
        res.status(statusCode).json({
          error: errorMessage,
          details: error.message,
          stack: error.stack
        });
    } finally {
        // 确保清理临时文件
        try {
            if (inputPath && fs.existsSync(inputPath)) {
                await fsPromises.unlink(inputPath);
                console.log('临时输入文件删除完成');
            }
            if (outputPath && fs.existsSync(outputPath)) {
                await fsPromises.unlink(outputPath);
                console.log('临时输出文件删除完成');
            }
        } catch (cleanupError) {
            console.error('清理临时文件时出错:', cleanupError);
        }
    }
});

function combineSegmentsIntoParagraphs(segments, maxParagraphDuration = 30) {
  const paragraphs = [];
  let currentParagraph = { start: 0, end: 0, text: '' };

  segments.forEach((segment, index) => {
    if (currentParagraph.text === '' || 
        (segment.start - currentParagraph.end) < 2 && // 如果段落间隔小于2秒
        (segment.end - currentParagraph.start) < maxParagraphDuration) { // 如果段落总时长小于maxParagraphDuration秒
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

  return paragraphs;
}

app.post('/api/process-transcription', async (req, res) => {
    const startTime = timer();
    const { transcription } = req.body;
    if (!transcription) {
        return res.status(400).json({ error: '没有提供转录文字' });
    }

    console.log('开始处理转录文字, 长度:', transcription.length, '字符');

    try {
        // A. 总结
        const summaryStartTime = timer();
        console.log('开始生成总结');
        const summaryResponse = await makeRequestWithRetry(`${BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SELF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          data: {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "你是一个视频内容总结助手。请简洁地总结以下内容。500个tokens以内" },
                { role: "user", content: transcription }
            ],
            max_tokens: 500  // 增加到500
          }
        });
        console.log('总结生成完成, 耗时:', timer(summaryStartTime), 'ms');

        const summary = summaryResponse.data.choices[0].message.content;
        console.log('生成的总结长度:', summary.length, '字符');

        // B. 预处理和标记重要句子
        const preprocessStartTime = timer();
        console.log('开始预处理和标记重要句子');
        const preprocessResponse = await makeRequestWithRetry(`${BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SELF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          data: {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "你是一个文本处理助手。请对以下文本进行处理：1、去除冗余的话（文章的举例千万不要去除，可以进行适当总结），2、保留原文的举例，3、保留因果关系的论证，4、保持好原文的推理逻辑，（因为、所以）5、去除人称视角 6、注意错别字和不通顺的句子（酌情修改）。同时，请标记出重要句子，用 <important> 标签包裹。" },
                { role: "user", content: transcription }
            ],
            max_tokens: 2000  // 增加到2000
          }
        });
        console.log('预处理和标记完成, 耗时:', timer(preprocessStartTime), 'ms');

        const preprocessed = preprocessResponse.data.choices[0].message.content;

        console.log('总结长度:', summary.length, '字符');
        console.log('预处理后长度:', preprocessed.length, '字符');
        console.log('总耗时:', timer(startTime), 'ms');

        // 添加日志以检查是否有截断
        console.log('总结内容:', summary);
        console.log('预处理内容:', preprocessed);

        res.json({
            summary,
            preprocessed
        });
    } catch (error) {
        console.error('处理转录文字时出错:', error);
        console.error('错误发生时总耗时:', timer(startTime), 'ms');
        res.status(500).json({
            error: '处理转录文字时出错',
            details: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});