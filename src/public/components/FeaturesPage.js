const FeaturesPage = () => (
    <div className="container mx-auto px-4 py-16 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-5xl font-bold mb-12 text-center gradient-text">功能特点</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard 
                icon={<AIIcon />}
                title="智能搜索算法" 
                description="利用先进的AI算法,提供更精准的搜索结果,帮助用户快速找到所需信息"
            />
            <FeatureCard 
                icon={<DataIcon />}
                title="多源数据整合" 
                description="整合多个平台的数据,为用户提供全面的信息视角,避免信息孤岛"
            />
            <FeatureCard 
                icon={<PersonIcon />}
                title="个性化推荐" 
                description="根据用户的搜索历史和偏好,提供个性化的内容推荐,提升用户体验"
            />
            <FeatureCard 
                icon={<AnalyticsIcon />}
                title="实时数据分析" 
                description="快速处理和分析大量数据,提供及时的洞察和趋势分析"
            />
            <FeatureCard 
                icon={<LanguageIcon />}
                title="多语言支持" 
                description="支持多种语言的搜索和结果展示,满足全球用户的需求"
            />
            <FeatureCard 
                icon={<VisualizationIcon />}
                title="可视化数据" 
                description="通过直观的图表和图形,清晰展示搜索结果和数据分析"
            />
        </div>
    </div>
);

const FeatureCard = ({ icon, title, description }) => (
    <div className="card p-6 hover:shadow-lg transition-all duration-300 bg-white rounded-lg">
        <div className="text-4xl mb-4 text-blue-500">{icon}</div>
        <h3 className="text-2xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const AIIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const DataIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
);

const PersonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const AnalyticsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const LanguageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
);

const VisualizationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

window.FeaturesPage = FeaturesPage;