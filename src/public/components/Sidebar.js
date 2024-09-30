const Sidebar = ({ isOpen, toggleSidebar, onNewQuestion, historyQuestions, onHistoryQuestionClick, theme, toggleTheme, children }) => {
    const [activeSection, setActiveSection] = React.useState('history');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [favorites, setFavorites] = React.useState(() => {
        const savedFavorites = localStorage.getItem('favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [tags, setTags] = React.useState(() => {
        const savedTags = localStorage.getItem('tags');
        return savedTags ? JSON.parse(savedTags) : {};
    });
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [username, setUsername] = React.useState('');

    React.useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('tags', JSON.stringify(tags));
    }, [favorites, tags]);

    const filteredQuestions = React.useMemo(() => {
        return historyQuestions.filter(question => 
            typeof question === 'string' && question.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [historyQuestions, searchTerm]);

    const toggleFavorite = (question) => {
        setFavorites(prevFavorites => 
            prevFavorites.includes(question)
                ? prevFavorites.filter(q => q !== question)
                : [...prevFavorites, question]
        );
    };

    const addTag = (question, newTag) => {
        setTags(prevTags => ({
            ...prevTags,
            [question]: [...(prevTags[question] || []), newTag]
        }));
    };

    const removeTag = (question, tagToRemove) => {
        setTags(prevTags => ({
            ...prevTags,
            [question]: prevTags[question].filter(tag => tag !== tagToRemove)
        }));
    };

    const clearHistory = () => {
        if (window.confirm('确定要清空历史记录吗？')) {
            onNewQuestion();
        }
    };

    const clearFavorites = () => {
        if (window.confirm('确定要清空收藏吗？')) {
            setFavorites([]);
            setTags({});
        }
    };

    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
    const hoverBgColor = theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

    return (
        <div className={`fixed top-0 left-0 h-full ${bgColor} ${textColor} transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} overflow-hidden shadow-lg`}>
            <div className="flex flex-col h-full">
                <div className={`p-4 flex items-center justify-between border-b ${borderColor}`}>
                    <h2 className={`font-bold text-xl ${isOpen ? 'block' : 'hidden'}`}>AI搜索助手</h2>
                    <button onClick={toggleSidebar} className={`${hoverBgColor} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-1`}>
                        {isOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-200">
                    <div className={`flex justify-around my-4 ${isOpen ? 'block' : 'hidden'}`}>
                        <button
                            onClick={() => setActiveSection('history')}
                            className={`px-4 py-2 rounded-lg ${activeSection === 'history' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                        >
                            历史
                        </button>
                        <button
                            onClick={() => setActiveSection('favorites')}
                            className={`px-4 py-2 rounded-lg ${activeSection === 'favorites' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                        >
                            收藏
                        </button>
                    </div>
                    <ul className="space-y-2 p-4">
                        <li>
                            <button
                                onClick={onNewQuestion}
                                className="w-full flex items-center p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {isOpen && <span>新问题</span>}
                            </button>
                        </li>
                        {isOpen && filteredQuestions.map((question, index) => (
                            <li key={index}>
                                <div className="mb-2">
                                    <button
                                        onClick={() => onHistoryQuestionClick(question)}
                                        className={`w-full text-left p-2 rounded-lg ${hoverBgColor} transition-colors duration-200 truncate flex items-center group focus:outline-none focus:ring-2 focus:ring-blue-300`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="truncate flex-grow">{question}</span>
                                        <button 
                                            className="hidden group-hover:block text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-1" 
                                            onClick={(e) => {e.stopPropagation(); toggleFavorite(question);}}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={favorites.includes(question) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                            </svg>
                                        </button>
                                    </button>
                                    {tags[question] && (
                                        <div className="flex flex-wrap mt-1">
                                            {tags[question].map((tag, tagIndex) => (
                                                <span key={tagIndex} className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full mr-1 mb-1">
                                                    {tag}
                                                    <button 
                                                        className="ml-1 focus:outline-none" 
                                                        onClick={() => removeTag(question, tag)}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        placeholder="添加标签"
                                        className={`mt-1 w-full px-2 py-1 text-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded`}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                addTag(question, e.target.value.trim());
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </li>
                        ))}
                        {isOpen && filteredQuestions.length === 0 && (
                            <li className="text-center text-gray-400 py-4">
                                {activeSection === 'history' ? '暂无历史记录' : '暂无收藏的问题'}
                            </li>
                        )}
                    </ul>
                </nav>
                <div className={`p-4 border-t ${borderColor}`}>
                    <button 
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="w-full flex items-center justify-center p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {isOpen && <span>设置</span>}
                    </button>
                    {isSettingsOpen && isOpen && (
                        <div className="mt-4 space-y-2">
                            <button 
                                onClick={clearHistory}
                                className="w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                            >
                                清空历史记录
                            </button>
                            <button 
                                onClick={clearFavorites}
                                className="w-full p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            >
                                清空收藏
                            </button>
                            <button 
                                onClick={toggleTheme}
                                className="w-full p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
                            >
                                {theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
                            </button>
                        </div>
                    )}
                </div>
                {/* 在设置按钮之后,添加 LoginComponent */}
                {isOpen && (
                    <LoginComponent 
                        isLoggedIn={isLoggedIn} 
                        setIsLoggedIn={setIsLoggedIn}
                        username={username}
                        setUsername={setUsername}
                    />
                )}
                
                {/* 保留原有的 children 渲染 */}
                {children}
            </div>
        </div>
    );
};

window.Sidebar = Sidebar;