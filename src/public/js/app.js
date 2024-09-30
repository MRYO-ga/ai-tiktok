const { useState, useEffect, useRef, Fragment } = React;
const { BrowserRouter, Route, Switch, Link } = ReactRouterDOM;

const DEBUG_MODE = false;

const App = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [historyQuestions, setHistoryQuestions] = useState([]);
    const [showInitialSearch, setShowInitialSearch] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // 这里可以添加一个验证 token 的 API 调用
            setIsLoggedIn(true);
            // 假设我们在 token 中存储了用户名,实际中可能需要解码 JWT
            setUsername(localStorage.getItem('username') || '用户');
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleNewQuestion = () => {
        setShowInitialSearch(true);
        setCurrentQuestion(null);
    };

    const handleHistoryQuestionClick = (question) => {
        setShowInitialSearch(false);
        setCurrentQuestion(question);
    };

    const updateHistory = (question) => {
        setHistoryQuestions(prevQuestions => {
            const newQuestions = [question, ...prevQuestions];
            return newQuestions.slice(0, 10); // 只保留最近的10个问题
        });
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
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
                                historyQuestions={historyQuestions}
                                onHistoryQuestionClick={handleHistoryQuestionClick}
                                theme={theme}
                                toggleTheme={toggleTheme}
                                isLoggedIn={isLoggedIn}
                                setIsLoggedIn={setIsLoggedIn}
                                username={username}
                                setUsername={setUsername}
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
                                            currentQuestion={currentQuestion}
                                            isLoading={isLoading}
                                            setIsLoading={setIsLoading}
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