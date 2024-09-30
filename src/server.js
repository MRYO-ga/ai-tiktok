require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { LLM_BASE_URL } = require('./config');
const tiktokRoutes = require('./routes/tiktok');
const transcribeRoutes = require('./routes/transcribe');
const xiaohongshuRoutes = require('./routes/xiaohongshu');
const chatRoutes = require('./routes/chat');
const chatRouter = require('./routes/chat');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 处理 /search 路由
app.get('/search', (req, res) => {
    // 这里应该是处理搜索请求的逻辑
    res.json({ message: "Search endpoint reached" });
});

// API 路由
app.use('/api', tiktokRoutes);

app.use('/api', transcribeRoutes);
app.use('/api', chatRoutes);
app.use('/api/chat', chatRouter);
app.use('/api', xiaohongshuRoutes);
// 根路由处理
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 处理
app.use((req, res) => {
    res.status(404).send('404 - Not Found');
});

console.log(`Using LLM_BASE_URL: ${LLM_BASE_URL}`);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});