const { useState, useEffect, useRef, Fragment } = React;
const { BrowserRouter, Route, Switch, Link } = ReactRouterDOM;

const DEBUG_MODE = false;

window.BASE_URL = 'http://localhost:3001/api';  // 请根据您的实际后端地址进行调整

const App = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 默认打开侧边栏
    const [historyConversations, setHistoryConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [showInitialSearch, setShowInitialSearch] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [conversations, setConversations] = useState([]); // 确保这里初始化为空数组
    const [userId, setUserId] = useState('');

    useEffect(() => {
        // 检查本地存储的登录信息并尝试自动登录
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        
        console.log('缓存内容:');
        console.log('Token:', token);
        console.log('Username:', storedUsername);

        if (token && storedUsername) {
            // 解析 token 获取 userId
            const parseJwt = (token) => {
                try {
                    return JSON.parse(atob(token.split('.')[1]));
                } catch (e) {
                    return null;
                }
            };
            
            const decodedToken = parseJwt(token);
            
            if (decodedToken && decodedToken.id) {
                console.log('从 Token 解析的 UserId:', decodedToken.id);
                
                // 验证 token 有效性
                const verifyToken = async () => {
                    try {
                        const response = await axios.post(`${window.BASE_URL}/auth/verify-token`, { token });
                        if (response.data.valid) {
                            setIsLoggedIn(true);
                            setUsername(storedUsername);
                            setUserId(decodedToken.id);
                            console.log('自动登录成功');

                            // 获取用户的聊天历史
                            const fetchChatHistory = async () => {
                                try {
                                    const chatHistory = await window.getChatHistory(decodedToken.id);
                                    if (chatHistory) {
                                        setHistoryConversations(chatHistory);
                                        console.log('获取聊天历史成功:', chatHistory);
                                    }
                                } catch (error) {
                                    console.error('获取聊天历史失败:', error);
                                }
                            };
                            fetchChatHistory();
                        } else {
                            console.log('Token 无效，清除本地存储');
                            handleLogout();
                        }
                    } catch (error) {
                        console.error('验证 token 失败:', error);
                        handleLogout();
                    }
                };
                verifyToken();
            } else {
                console.log('无法从 Token 解析 UserId，清除本地存储');
                handleLogout();
            }
        } else {
            console.log('未找到有效的登录信息，无法自动登录');
        }
    }, []);

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleNewQuestion = () => {
        setShowInitialSearch(true);
        setCurrentConversation(null);
    };

    const handleHistoryConversationClick = (conversation) => {
        setShowInitialSearch(false);
        setCurrentConversation(conversation);
        setConversations(conversation.conversations || []); // 添加空数组作为默认值
    };

    const updateHistory = (question, answer, searchResults) => {
        setHistoryConversations(prevHistory => {
            let updatedHistory;
            let newConversation;  // 在这里声明 newConversation
            if (currentConversation) {
                // 更新现有会话
                updatedHistory = prevHistory.map(conv => 
                    conv.id === currentConversation.id 
                        ? {...conv, conversations: [...(conv.conversations || []), ...(searchResults || [])]}
                        : conv
                );
            } else {
                // 创建新会话
                newConversation = {
                    id: Date.now(),
                    title: question,
                    conversations: searchResults || [],
                    timestamp: new Date().toISOString()
                };
                updatedHistory = [newConversation, ...prevHistory];
                setCurrentConversation(newConversation);
            }
            console.log("更新后的历史记录:", updatedHistory);

            // 保存聊天记录到数据库
            if (isLoggedIn && userId) {
                const conversationId = currentConversation ? currentConversation.id : newConversation.id;
                console.log('Saving chat history:', { userId, conversationId, content: { question, answer, searchResults } });
                window.saveChatHistory(userId, conversationId, {
                    question,
                    answer,
                    searchResults
                });
            }

            return updatedHistory.slice(0, 10); // 只保留最近的10个会话
        });
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // 修改 handleLogin 函数
    const handleLogin = async (username, password) => {
        const result = await window.loginUser(username, password);
        if (result.success) {
            setIsLoggedIn(true);
            setUsername(result.username);
            setUserId(result.userId);
            localStorage.setItem('token', result.token);
            localStorage.setItem('username', result.username);

            // 打印缓存内容
            console.log('登录成功，缓存内容:');
            console.log('Token:', result.token);
            console.log('Username:', result.username);
            console.log('从 Token 解析的 UserId:', result.userId);

            const chatHistory = await window.getChatHistory(result.userId);
            if (chatHistory) {
                setHistoryConversations(chatHistory);
                console.log('获取聊天历史成功:', chatHistory);
            }
        } else {
            console.log('登录失败');
        }
    };

    // 修改 handleLogout 函数
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsername('');
        setUserId('');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setHistoryConversations([]);
    };

    return (
        <BrowserRouter>
            <div className={`flex flex-col min-h-screen ${theme} bg-gradient`}>
                <div className="fixed top-0 left-0 w-full z-20">
                    <nav className="bg-white dark:bg-gray-800 shadow-md h-16">
                        <ul className="flex h-full items-center justify-center space-x-6 px-4 max-w-7xl mx-auto">
                            <li><Link to="/" className="nav-link text-lg hover:text-blue-600 transition-colors duration-300">首页</Link></li>
                            <li><Link to="/about" className="nav-link text-lg hover:text-blue-600 transition-colors duration-300">关于我们</Link></li>
                            <li><Link to="/features" className="nav-link text-lg hover:text-blue-600 transition-colors duration-300">功能特点</Link></li>
                            <li><Link to="/pricing" className="nav-link text-lg hover:text-blue-600 transition-colors duration-300">定价</Link></li>
                            <li><Link to="/search" className="nav-link text-lg hover:text-blue-600 transition-colors duration-300">搜索</Link></li>
                        </ul>
                    </nav>
                </div>
                <div className="flex flex-1 pt-16 w-full max-w-7xl mx-auto">
                    {window.Sidebar && (
                        <div className="z-30">
                            <window.Sidebar 
                                isOpen={isSidebarOpen} 
                                toggleSidebar={toggleSidebar} 
                                onNewQuestion={handleNewQuestion}
                                historyConversations={historyConversations}
                                onHistoryConversationClick={handleHistoryConversationClick}
                                theme={theme}
                                toggleTheme={toggleTheme}
                                isLoggedIn={isLoggedIn}
                                setIsLoggedIn={setIsLoggedIn}
                                username={username}
                                setUsername={setUsername}
                                onLogin={handleLogin}
                                onLogout={handleLogout}
                            />
                        </div>
                    )}
                    <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                        <main className="flex-1 overflow-y-auto p-6">
                            <Switch>
                                <Route exact path="/" component={window.HomePage} />
                                <Route path="/about" component={window.AboutPage} />
                                <Route path="/features" component={window.FeaturesPage} />
                                <Route path="/search">
                                    {window.SearchInterface && (
                                        <window.SearchInterface 
                                            onHistoryUpdate={updateHistory}
                                            showInitialSearch={showInitialSearch}
                                            setShowInitialSearch={setShowInitialSearch}
                                            currentConversation={currentConversation}
                                            isLoading={isLoading}
                                            setIsLoading={setIsLoading}
                                            conversations={conversations}
                                            setConversations={setConversations}
                                            userId={userId}
                                            isLoggedIn={isLoggedIn}
                                        />
                                    )}
                                </Route>
                                <Route path="/pricing" component={window.PricingPage} />
                            </Switch>
                        </main>
                    </div>
                </div>
            </div>
        </BrowserRouter>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));