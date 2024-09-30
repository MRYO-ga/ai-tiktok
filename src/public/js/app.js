const { useState, useEffect, useRef, Fragment } = React;
const { BrowserRouter, Route, Switch, Link } = ReactRouterDOM;

const DEBUG_MODE = false;

const App = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [historyQuestions, setHistoryQuestions] = useState([]);
    const [showInitialSearch, setShowInitialSearch] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <BrowserRouter>
            <div className="flex h-screen bg-striped">
                {window.Sidebar && (
                    <window.Sidebar 
                        isOpen={isSidebarOpen} 
                        toggleSidebar={toggleSidebar} 
                        onNewQuestion={handleNewQuestion}
                        historyQuestions={historyQuestions}
                        onHistoryQuestionClick={handleHistoryQuestionClick}
                    />
                )}
                <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    <nav className="bg-white shadow-md">
                        <ul className="flex p-4 justify-center space-x-6">
                            <li><Link to="/" className="nav-link text-lg hover:text-blue-600 transition-colors duration-300">首页</Link></li>
                            <li><Link to="/about" className="nav-link text-lg hover:text-blue-600 transition-colors duration-300">关于我们</Link></li>
                            <li><Link to="/search" className="nav-link text-lg hover:text-blue-600 transition-colors duration-300">搜索</Link></li>
                        </ul>
                    </nav>
                    <Switch>
                        <Route exact path="/" component={window.HomePage} />
                        <Route path="/about" component={window.AboutPage} />
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
                    </Switch>
                </div>
            </div>
        </BrowserRouter>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));