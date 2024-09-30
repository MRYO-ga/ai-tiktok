const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-gradient py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 text-center text-indigo-800 dark:text-indigo-300 animate-fade-in">功能特点</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <FeatureCard
            icon={<MultiSourceIcon />}
            title="多源数据整合"
            description="整合多个平台的数据,为您提供全面的搜索结果。无论是视频、图片还是文本,我们都能为您找到最相关的信息。"
          />
          <FeatureCard
            icon={<AiAnalysisIcon />}
            title="AI智能分析"
            description="运用先进的AI算法,深度分析搜索内容,提取关键信息,让您快速获取核心要点。"
          />
          <FeatureCard
            icon={<PersonalizationIcon />}
            title="个性化推荐"
            description="基于您的搜索历史和偏好,提供量身定制的搜索结果和推荐,让每次搜索都更贴近您的需求。"
          />
          <FeatureCard
            icon={<RealTimeIcon />}
            title="实时更新"
            description="我们的系统实时抓取和处理最新信息,确保您获得的搜索结果始终保持最新、最相关。"
          />
        </div>
        
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-8 text-indigo-800 dark:text-indigo-300">准备开始您的智能搜索之旅了吗?</h2>
          <Link to="/search" className="btn btn-primary">
            立即体验
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="card p-8 animate-fade-in">
    <div className="text-4xl text-indigo-600 dark:text-indigo-400 mb-4">{icon}</div>
    <h3 className="text-2xl font-semibold text-indigo-800 dark:text-indigo-300 mb-4">{title}</h3>
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
  </div>
);

const MultiSourceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const AiAnalysisIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PersonalizationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RealTimeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

window.FeaturesPage = FeaturesPage;