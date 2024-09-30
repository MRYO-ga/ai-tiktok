const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-8 text-indigo-600 animate-fade-in">
          欢迎来到智能搜索引擎
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-gray-600 animate-fade-in">
          利用AI技术,为您提供最精准、全面的搜索体验
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
          <Link to="/search" className="btn btn-primary">
            开始搜索
          </Link>
          <Link to="/features" className="btn btn-secondary">
            了解更多
          </Link>
        </div>
      </div>
      <div className="mt-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-indigo-600">我们的优势</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<AiIcon />}
            title="AI驱动"
            description="采用最先进的AI技术,提供智能化的搜索结果"
          />
          <FeatureCard
            icon={<AccuracyIcon />}
            title="高精准度"
            description="精确匹配您的搜索意图,呈现最相关的信息"
          />
          <FeatureCard
            icon={<SpeedIcon />}
            title="快速响应"
            description="优化的算法确保快速检索和呈现搜索结果"
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="card p-6 animate-fade-in">
    <div className="text-4xl text-indigo-600 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-indigo-600 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const AiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const AccuracyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SpeedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

window.HomePage = HomePage;