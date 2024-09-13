const SearchBar = ({ input, setInput, handleSearch, isLoading, handleKeyPress }) => (
    <div className="flex">
        <div className="relative flex-grow">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'main')}
                className="input-field w-full rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-2xl py-4 px-6 bg-white text-gray-800 placeholder-gray-400 transition-all duration-300"
                placeholder="搜索视频..."
            />
        </div>
        <button
            onClick={() => handleSearch(input, true)}
            className="button rounded-r-full hover:bg-blue-600 transition-all duration-300 px-8 bg-blue-500 text-white"
            disabled={isLoading}
        >
            {isLoading ? (
                <i className="mdi mdi-loading mdi-spin text-3xl"></i>
            ) : (
                <i className="mdi mdi-magnify text-3xl"></i>
            )}
        </button>
    </div>
);

window.SearchBar = SearchBar;