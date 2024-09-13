const SearchBar = ({ input, setInput, handleSearch, isLoading, handleKeyPress }) => (
    <div className="flex items-center">
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 'main')}
            className="input-field flex-1 mr-2"
            placeholder="搜索视频..."
        />
        <button
            onClick={() => handleSearch(input, true)}
            className="button"
            disabled={isLoading}
        >
            {isLoading ? (
                <i className="mdi mdi-loading mdi-spin text-xl"></i>
            ) : (
                <i className="mdi mdi-magnify text-xl"></i>
            )}
        </button>
    </div>
);

window.SearchBar = SearchBar;