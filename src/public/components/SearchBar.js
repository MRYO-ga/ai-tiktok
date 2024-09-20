const SearchBar = ({ input, setInput, handleSearch, isLoading, handleKeyPress }) => (
    <div className="mb-6">
        <div className="flex">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'main')}
                className="input-field flex-1 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 py-3 px-6 transition-all duration-300"
                placeholder="输入您的问题..."
                disabled={isLoading}
            />
            <button
                onClick={() => handleSearch(input, true)}
                className="button rounded-r-full hover:bg-blue-600 transition-all duration-300 bg-blue-500 text-white px-8"
                disabled={isLoading}
            >
                {isLoading ? (
                    <i className="mdi mdi-loading mdi-spin"></i>
                ) : (
                    <i className="mdi mdi-magnify"></i>
                )}
            </button>
        </div>
    </div>
);

window.SearchBar = SearchBar;