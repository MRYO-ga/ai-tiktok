const FollowUpInput = ({ followUpQuestion, setFollowUpQuestion, handleKeyPress, handleSearch, isLoading }) => (
    <div className="p-8 border-t">
        <div className="flex">
            <input
                type="text"
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'followUp')}
                className="input-field flex-1 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="追加问题或开始新对话..."
                disabled={isLoading}
            />
            <button
                onClick={() => handleSearch(followUpQuestion)}
                className="button rounded-r-lg hover:bg-blue-600 transition-colors"
                disabled={isLoading}
            >
                {isLoading ? (
                    <i className="mdi mdi-loading mdi-spin"></i>
                ) : (
                    <i className="mdi mdi-magnify"></i>
                )}
            </button>
            <button
                onClick={() => handleSearch(followUpQuestion, true)}
                className="button bg-green-500 rounded-lg ml-2 hover:bg-green-600 transition-colors"
                title="开始新对话"
                disabled={isLoading}
            >
                {isLoading ? (
                    <i className="mdi mdi-loading mdi-spin"></i>
                ) : (
                    <i className="mdi mdi-plus"></i>
                )}
            </button>
        </div>
    </div>
);

window.FollowUpInput = FollowUpInput;