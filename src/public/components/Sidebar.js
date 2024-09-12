const Sidebar = ({ isOpen, toggleSidebar, onNewQuestion, historyQuestions, onHistoryQuestionClick }) => {
    const [activeMenu, setActiveMenu] = React.useState('历史记录');
    const menuItems = [
        { icon: 'mdi-plus', text: '新问题', action: onNewQuestion },
        { icon: 'mdi-account', text: '我的空间' },
        { icon: 'mdi-bookmark', text: '收藏' },
        { icon: 'mdi-history', text: '历史记录' },
        { icon: 'mdi-cog', text: '设置' },
    ];

    return (
        <aside className={`sidebar text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex flex-col shadow-lg`}>
            <div className="p-4 flex items-center justify-between border-b border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">QXX</span>
                </div>
                <button onClick={toggleSidebar} className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-full transition-colors">
                    <i className={`mdi ${isOpen ? 'mdi-chevron-left' : 'mdi-chevron-right'} text-xl`}></i>
                </button>
            </div>
            <nav className="flex-1 mt-4 overflow-y-auto">
                {menuItems.map((item, index) => (
                    <div key={index} className="mb-2">
                        <a
                            href="#"
                            className={`flex items-center p-3 hover:bg-white hover:bg-opacity-10 transition-colors rounded-lg mx-2 ${activeMenu === item.text ? 'bg-white bg-opacity-10' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                if (item.action) {
                                    item.action();
                                }
                                setActiveMenu(activeMenu === item.text ? '' : item.text);
                            }}
                        >
                            <i className={`mdi ${item.icon} text-xl sidebar-icon`}></i>
                            <span className={`ml-4 ${isOpen ? '' : 'hidden'}`}>{item.text}</span>
                            {item.text === '历史记录' && isOpen && (
                                <i className={`mdi mdi-chevron-down ml-auto ${activeMenu === '历史记录' ? 'transform rotate-180' : ''}`}></i>
                            )}
                        </a>
                        {item.text === '历史记录' && isOpen && activeMenu === '历史记录' && (
                            <div className="ml-8 mt-2 max-h-60 overflow-y-auto">
                                {historyQuestions.map((question, hIndex) => (
                                    <a 
                                        key={hIndex} 
                                        href="#" 
                                        className="block py-2 px-4 text-sm hover:bg-white hover:bg-opacity-10 rounded-lg truncate"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onHistoryQuestionClick(question);
                                        }}
                                    >
                                        {question}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

// 修改这里，使用 window.Sidebar 来导出组件
window.Sidebar = Sidebar;