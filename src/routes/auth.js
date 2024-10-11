const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { HttpsProxyAgent } = require('https-proxy-agent');
const { PROXY_URL } = require('../config');

// 连接到 SQLite 数据库
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        // 创建用户表(如果不存在)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);
        // 创建聊天记录表(如果不存在)
        db.run(`CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            conversation_id TEXT,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
    }
});

// 设置代理
const proxyUrl = PROXY_URL;
const httpsAgent = new HttpsProxyAgent(proxyUrl);

// 修改 Google 策略
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/api/auth/google/callback",
    proxy: true,
    agent: httpsAgent
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log('Google OAuth callback reached');
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    console.log('Profile:', JSON.stringify(profile, null, 2));
    
    if (!profile) {
      console.error('No profile received from Google');
      return cb(new Error('Failed to retrieve user profile from Google'));
    }
    
    // 这里应该检查用户是否已存在,如果不存在则创建新用户
    // 然后生成 JWT token
    const token = jwt.sign({ id: profile.id, username: profile.displayName }, process.env.JWT_SECRET, { expiresIn: '1h' });
    cb(null, { token, user: profile });
  }
));

// 确保设置了序列化和反序列化函数
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// 修改 GitHub 策略
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/api/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // 这里应该检查用户是否已存在,如果不存在则创建新用户
    // 然后生成 JWT token
    const token = jwt.sign({ id: profile.id, username: profile.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    cb(null, { token, user: profile });
  }
));

// Google 认证路由
router.get('/google',
  (req, res, next) => {
    console.log('Starting Google OAuth process');
    console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('Callback URL:', "http://localhost:3001/api/auth/google/callback");
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: Math.random().toString(36).substring(7) // 添加一个随机状态
  })
);

router.get('/google/callback', 
  (req, res, next) => {
    console.log('Google OAuth callback received');
    console.log('Query parameters:', req.query);
    if (req.query.error) {
      console.error('Google OAuth error:', req.query.error);
    }
    next();
  },
  passport.authenticate('google', { session: false }),
  function(req, res) {
    console.log('Google authentication successful');
    res.redirect(`/?token=${req.user.token}`);
  }
);

// GitHub 认证路由
router.get('/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

router.get('/github/callback', 
  passport.authenticate('github', { session: false }),
  function(req, res) {
    res.redirect(`/?token=${req.user.token}`);
  });

// 注册路由
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // 检查用户名是否已存在
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
            if (err) {
                return res.status(500).json({ message: '服务器错误' });
            }
            if (row) {
                return res.status(400).json({ message: '用户名已存在' });
            }

            // 如果用户名不存在,则创建新用户
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
                if (err) {
                    return res.status(500).json({ message: '注册失' });
                }
                res.status(201).json({ message: '注册成功' });
            });
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 修改登录路由
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username, password: '******' });
    
    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ message: '用户名和密码都是必填项' });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: '服务器错误' });
        }
        if (!user) {
            console.log('User not found:', username);
            return res.status(400).json({ message: '用户名或密码错误' });
        }

        try {
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                console.log('Invalid password for user:', username);
                return res.status(400).json({ message: '用户名或密码错误' });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('Login successful for user:', username);
            res.json({ token, username: user.username, userId: user.id });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: '服务器错误' });
        }
    });
});

// 修改保存聊天记录的路由
router.post('/save-chat-history', (req, res) => {
    const { userId, conversationId, content } = req.body;
    
    console.log('Received save chat history request:', req.body);

    if (!userId || !conversationId || !content) {
        console.error('Missing required parameters:', { userId, conversationId, content });
        return res.status(400).json({ message: '缺少必要参数' });
    }

    // 确保 content 是字符串
    const contentString = typeof content === 'string' ? content : JSON.stringify(content);

    db.run('INSERT OR REPLACE INTO chat_history (user_id, conversation_id, content) VALUES (?, ?, ?)', 
        [userId, conversationId, contentString], 
        (err) => {
            if (err) {
                console.error('保存聊天记录失败:', err);
                return res.status(500).json({ message: '保存聊天记录失败' });
            }
            res.json({ success: true, message: '聊天记录保存成功' });
        }
    );
});

// 修改获取聊天记录的路由
router.get('/get-chat-history/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        console.log('未提供 userId');
        return res.status(400).json({ message: '缺少 userId 参数' });
    }

    db.all('SELECT * FROM chat_history WHERE user_id = ? ORDER BY conversation_id DESC', [userId], (err, rows) => {
        if (err) {
            console.error('获取聊天记录失败:', err);
            return res.status(500).json({ message: '获取聊天记录失败' });
        }
        const chatHistory = rows.map(row => {
            try {
                return {
                    ...row,
                    content: JSON.parse(row.content)
                };
            } catch (error) {
                console.error('解析聊天记录内容失败:', error);
                return {
                    ...row,
                    content: row.content // 如果解析失败，返回原始字符串
                };
            }
        });
        res.json(chatHistory);
    });
});

// 添加验证 token 的路由
router.post('/verify-token', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ valid: false, message: '缺少 token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.json({ valid: false, message: 'token 无效' });
        }
        res.json({ valid: true, userId: decoded.id, username: decoded.username });
    });
});

module.exports = router;