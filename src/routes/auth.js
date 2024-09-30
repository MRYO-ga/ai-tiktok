const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

// 连接到 SQLite 数据库
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // 创建用户表(如果不存在)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);
    }
});

// 设置 Google 策略
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/api/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // 处理用户信息
    // 这里您需要实现用户信息的处理逻辑
    // 例如,检查用户是否已存在,如果不存在则创建新用户
    // 然后调用 cb(null, user) 来完成认证过程
  }
));

// 设置 GitHub 策略
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/api/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // 处理用户信息
  }
));

// Google 认证路由
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // 成功认证,重定向回主页
    res.redirect('/');
  });

// GitHub 认证路由
router.get('/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // 成功认证,重定向回主页
    res.redirect('/');
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
                    return res.status(500).json({ message: '注册失败' });
                }
                res.status(201).json({ message: '注册成功' });
            });
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 登录路由
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username, password: '******' });
    
    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ message: '用户名和码都是必填项' });
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

            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not set');
                return res.status(500).json({ message: '服务器配置错误' });
            }

            console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('Login successful for user:', username);
            res.json({ token, username: user.username });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: '服务器错误' });
        }
    });
});

// Debugging outputs
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID);

module.exports = router;