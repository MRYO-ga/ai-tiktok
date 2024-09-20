const { useState, useEffect, useRef, Fragment } = React;

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
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));