const SearchBox = () => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="max-w-4xl mx-auto mt-16 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入您的搜索关键词..."
          className="w-full md:flex-grow px-6 py-4 text-lg rounded-full md:rounded-r-none border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-blue-700 mb-4 md:mb-0"
        />
        <button
          type="submit"
          className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full md:rounded-l-none hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:bg-blue-800 dark:hover:bg-blue-900"
        >
          搜索
        </button>
      </form>
      <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
        <p>热门搜索: <span className="font-semibold">AI, 机器学习, 大数据, 云计算</span></p>
      </div>
    </div>
  );
};

window.SearchBox = SearchBox;