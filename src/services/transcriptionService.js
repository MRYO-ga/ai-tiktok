const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const FormData = require('form-data');
const axios = require('axios');
const puppeteer = require('puppeteer');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);
const { OPEN_AI_KEY, SELF_API_KEY, BD_LLM_URL, BASE_URL } = require('../config');

const convertAndTranscribe = async (file) => {
    // 直接返回响应内容
    return {
        text: '我前段时间不是说想换华为手机吗 然后国庆节前这个Mate 30 Pro发布 我就真买了一台 现在用了一个多星期了 我发现它好的地方是真的很好 但是差的地方也挺让我痛苦的 我给你一下下说 首先是信号是真的好 我之前用的iPhone XS 就莫名其妙有的时候上网就很慢 极端情况下干脆就没信号了 但是换这个华为之后 我发现在我家小区里面 现在在地库什么电梯里边信号都很好 我觉得华为真不愧是一家做通信的公司 其次这个相机是真的很厉害 尤其是在弱光环境下 有的时候傍晚或者晚上 你用那种夜景模式去拍摄 你拍出来之后看这个屏幕上 比你直接用肉眼去看世界还清楚 因为它感光真的太厉害了 我觉得这个真的就太了不起了 我已经把我相机二手卖了 因为真的不需要了 再然后是电池 用一天不用充电这个不稀奇 它厉害的是48瓦的超级快充 你一旦把那线插上 你是肉眼看着这个电再往上跑的 iPhone用户哪见过这场面 直接就惊呆了 但是它不是没有缺点 首先一个最大的缺点 我觉得就是它因为做这个全面屏 它是把这个传统的听筒取消了的 然后是用这种屏幕去震动发声 这样你接电话的时候 是通过这个屏幕这震动 然后你来听听对方的声音 这个效果是其实明显不如 传统的那种听筒好的 我实际上在这种商场机场 接过几次电话 那个声音是几乎是听不清的 只能用耳机 第二个是它把侧边的 这个传统的音量按钮取消了 然后搞了这么一个 你看 就是你需要双击一下 然后呼出这么一个 虚拟的音量操作来 就这个新颖是挺新颖的 但是有时候你比方说 在一个很安静的办公室里面 然后你打开一个视频 突然声音很大 你想调低音量 但是你敲半天像刚才一样 你呼不出这个操作来 这就很尴尬了 第三个问题是输入法 因为你看这曲面屏 这屏幕是弯到侧边来的 这意味着什么呢 就是最脚上的Q和P这两个字母 是跟着这个屏幕弯过来的 这意味你在正面 碰着Q和P这两个字母的时候 面积是偏小的 有时候你会碰不到 这个我觉得应该是能够通过软件适配 特别希望SOGO能够尽快解决这个问题 最后一个现在这个问题 只要不是iPhone都没法解决 就是CarPlay 它是一套车载的交互系统 它能够让你的手机跟你的车 连成一套特别好的这种交互体验 那你如果不是iPhone的话 现在在国内你只能用 比方说像百度的那种CarLife了 我跟你说 这个体验真的是差到十万八千里 所以虽然现在这个Mate30 Pro 我是天天用 但我原来的iPhone 还是没法二手卖掉 现在只能同时用两个手机 卖好东西省下钱 关注前台面积部 我是欧阳 下回见',
        paragraphs: [
          {
            start: 0,
            end: 29.040000915527344,
            text: '我前段时间不是说想换华为手机吗 然后国庆节前这个Mate 30 Pro发布 我就真买了一台 现在用了一个多星期了 我发现它好的地方是真的很好 但是差的地方也挺让我痛苦的 我给你一下下说 首先是信号是真的好 我之前用的iPhone XS 就莫名其妙有的时候上网就很慢 极端情况下干脆就没信号了 但是换这个华为之后 我发现在我家小区里面 现在在地库什么电梯里边信号都很好 我觉得华为真不愧是一家做通信的公司 其次这个相机是真的很厉害 尤其是在弱光环境下'
          },
          {
            start: 29.040000915527344,
            end: 58,
            text: '有的时候傍晚或者晚上 你用那种夜景模式去拍摄 你拍出来之后看这个屏幕上 比你直接用肉眼去看世界还清楚 因为它感光真的太厉害了 我觉得这个真的就太了不起了 我已经把我相机二手卖了 因为真的不需要了 再然后是电池 用一天不用充电这个不稀奇 它厉害的是48瓦的超级快充 你一旦把那线插上 你是肉眼看着这个电再往上跑的 iPhone用户哪见过这场面 直接就惊呆了 但是它不是没有缺点 首先一个最大的缺点 我觉得就是它因为做这个全面屏'
          },
          {
            start: 58,
            end: 86.76000213623047,
            text: '它是把这个传统的听筒取消了的 然后是用这种屏幕去震动发声 这样你接电话的时候 是通过这个屏幕这震动 然后你来听听对方的声音 这个效果是其实明显不如 传统的那种听筒好的 我实际上在这种商场机场 接过几次电话 那个声音是几乎是听不清的 只能用耳机 第二个是它把侧边的 这个传统的音量按钮取消了 然后搞了这么一个 你看 就是你需要双击一下 然后呼出这么一个 虚拟的音量操作来 就这个新颖是挺新颖的 但是有时候你比方说'
          },
          {
            start: 86.76000213623047,
            end: 116.55999755859375,
            text: '在一个很安静的办公室里面 然后你打开一个视频 突然声音很大 你想调低音量 但是你敲半天像刚才一样 你呼不出这个操作来 这就很尴尬了 第三个问题是输入法 因为你看这曲面屏 这屏幕是弯到侧边来的 这意味着什么呢 就是最脚上的Q和P这两个字母 是跟着这个屏幕弯过来的 这意味你在正面 碰着Q和P这两个字母的时候 面积是偏小的 有时候你会碰不到 这个我觉得应该是能够通过软件适配 特别希望SOGO能够尽快解决这个问题 最后一个现在这个问题 只要不是iPhone都没法解决 就是CarPlay'
          },
          {
            start: 116.55999755859375,
            end: 136.63999938964844,
            text: '它是一套车载的交互系统 它能够让你的手机跟你的车 连成一套特别好的这种交互体验 那你如果不是iPhone的话 现在在国内你只能用 比方说像百度的那种CarLife了 我跟你说 这个体验真的是差到十万八千里 所以虽然现在这个Mate30 Pro 我是天天用 但我原来的iPhone 还是没法二手卖掉 现在只能同时用两个手机 卖好东西省下钱 关注前台面积部 我是欧阳 下回见'
          }
        ]
    };
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
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
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
    const videoResponse = await axios({
      method: 'get',
      url: videoSrc,
      responseType: 'stream'
    });

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
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
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
  console.log('开始处理转录文本');
  console.log(`转录文本长度: ${transcription.length}`);

  console.log('请求摘要...');
  const summaryResponse = await axios.post(`${BD_LLM_URL}/chat/completions`, {
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
  const preprocessResponse = await axios.post(`${BD_LLM_URL}/chat/completions`, {
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
  convertAndTranscribe,
  convertAndTranscribeUrl,
  processTranscription,
  combineSegmentsIntoParagraphs
};