# AI TikTok 视频分析系统

## 项目描述

AI TikTok 视频分析系统是一个基于人工智能的视频内容分析工具。该系统能够处理上传的视频或视频URL,进行音频转文字,并对内容进行智能分析和总结。

## 主要功能

- 视频上传和URL处理
- 音频提取和转录
- 内容智能分析和总结
- 相关问题生成
- 历史记录查询

## 技术栈

- 后端: Node.js, Express
- 前端: React (使用CDN引入)
- 数据库: 内存缓存 (Node-Cache)
- AI模型: OpenAI GPT-3.5/GPT-4
- 其他工具: FFmpeg, Puppeteer

## 安装和运行

1. 克隆仓库:
   ```
   git clone https://github.com/your-username/ai-tiktok.git
   cd ai-tiktok
   ```

2. 安装依赖:
   ```
   npm install
   ```

3. 创建并配置 `.env` 文件:
   ```
   OPEN_AI_KEY=your_openai_api_key
   SELF_API_KEY=your_self_api_key
   BASE_URL=your_base_url
   ```

4. 运行服务器:
   ```
   node server.js
   ```

5. 在浏览器中打开 `ai-tiktok.html` 文件

## 使用说明

1. 在主页面上传视频文件或输入视频URL
2. 系统将自动处理视频,提取音频并转录为文字
3. 点击"处理转录文字"按钮进行内容分析
4. 查看生成的内容总结、重要句子和相关问题
5. 可以进行追加提问或开始新的对话

## 注意事项

- 确保已安装FFmpeg并正确配置环境变量
- 使用前请确保已获得有效的OpenAI API密钥
- 处理大型视频文件可能需要较长时间,请耐心等待

## 贡献

欢迎提交问题和拉取请求。对于重大更改,请先开issue讨论您想要更改的内容。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
