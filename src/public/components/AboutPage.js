const AboutPage = () => {
  const [activeTab, setActiveTab] = React.useState('company');

  return (
    <div className="min-h-screen bg-gradient py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 text-center text-indigo-800 dark:text-indigo-300 animate-fade-in">关于我们</h1>
        
        <div className="mb-12 card overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-4 px-6 text-lg font-medium ${activeTab === 'company' ? 'bg-indigo-500 text-white' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'}`}
              onClick={() => setActiveTab('company')}
            >
              公司简介
            </button>
            <button
              className={`flex-1 py-4 px-6 text-lg font-medium ${activeTab === 'mission' ? 'bg-indigo-500 text-white' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'}`}
              onClick={() => setActiveTab('mission')}
            >
              使命与愿景
            </button>
          </div>
          <div className="p-8">
            {activeTab === 'company' && (
              <div className="animate-fade-in">
                <p className="text-xl mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                  我们是一家致力于将AI技术应用于信息检索的创新公司。我们的目标是为用户提供最相关、最有价值的信息,彻底改变人们获取和处理信息的方式。
                </p>
                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  通过整合多个平台的数据源,结合先进的AI算法,我们能够为用户提供全面而精准的搜索结果,助力用户在信息海洋中找到真正有价值的内容。
                </p>
              </div>
            )}
            {activeTab === 'mission' && (
              <div className="animate-fade-in">
                <MissionVisionCard 
                  title="我们的使命" 
                  description="让信息检索变得更加智能、高效,为用户节省时间并提供有价值的洞察。我们致力于创造一个人人都能轻松获取所需信息的世界。"
                  icon={<MissionIcon />}
                />
                <MissionVisionCard 
                  title="我们的愿景" 
                  description="成为AI驱动的信息检索领域的领导者,推动行业创新和发展。我们期望在未来,每个人都能享受到AI带来的智能搜索体验。"
                  icon={<VisionIcon />}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<InnovationIcon />}
            title="创新技术"
            description="我们不断探索和应用最前沿的AI技术,为用户带来革命性的搜索体验。"
          />
          <FeatureCard 
            icon={<UserCentricIcon />}
            title="以用户为中心"
            description="我们深入理解用户需求,不断优化产品,提供直观、高效的使用体验。"
          />
          <FeatureCard 
            icon={<DataPrivacyIcon />}
            title="数据隐私"
            description="我们高度重视用户隐私,采用先进的加密技术保护用户数据安全。"
          />
        </div>
      </div>
    </div>
  );
};

const MissionVisionCard = ({ title, description, icon }) => (
  <div className="bg-indigo-50 dark:bg-indigo-900 rounded-lg p-6 mb-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center mb-4">
      <div className="text-4xl text-indigo-600 dark:text-indigo-400 mr-4">{icon}</div>
      <h3 className="text-2xl font-semibold text-indigo-800 dark:text-indigo-300">{title}</h3>
    </div>
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="card p-6 animate-fade-in">
    <div className="text-4xl text-indigo-600 dark:text-indigo-400 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300 mb-2">{title}</h3>
    <p className="text-gray-700 dark:text-gray-300">{description}</p>
  </div>
);

const MissionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const VisionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const InnovationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const UserCentricIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const DataPrivacyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

window.AboutPage = AboutPage;