const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>
        <div className="relative z-10">
            <header className="text-center py-20 px-4">
                <h1 className="text-6xl font-bold mb-6 gradient-text animate-fade-in">智能搜索的未来</h1>
                <p className="text-xl mb-10 text-gray-600 max-w-2xl mx-auto animate-fade-in-delay">利用先进的AI技术，为您提供精准的搜索结果和深度洞察。体验信息检索的革命性变化。</p>
                <Link to="/search" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 inline-flex items-center shadow-lg animate-bounce">
                    开始探索
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </header>

            <section className="py-20 bg-gray-50">
                <h2 className="text-4xl font-bold mb-16 text-center gradient-text">核心功能</h2>
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
                    <FeatureCard
                        title="智能搜索"
                        description="利用AI算法理解查询意图，提供最相关结果。"
                        icon={<SearchIcon />}
                    />
                    <FeatureCard
                        title="多源数据整合"
                        description="整合小红书和抖音等平台数据，提供全面信息。"
                        icon={<DataIcon />}
                    />
                    <FeatureCard
                        title="实时分析与洞察"
                        description="实时处理大量数据，提供及时的市场洞察。"
                        icon={<AnalyticsIcon />}
                    />
                    <FeatureCard
                        title="个性化推荐"
                        description="基于搜索历史和兴趣，推荐相关热门话题。"
                        icon={<RecommendIcon />}
                    />
                </div>
            </section>

            <HowToUseSection />

            <StatsSection />

            <TestimonialSection />

            <FAQSection />

            <section className="py-20 text-center bg-blue-50">
                <h2 className="text-3xl font-semibold mb-8">准备好开始探索了吗？</h2>
                <Link to="/search" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 inline-flex items-center shadow-lg">
                    立即体验
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </section>
        </div>
    </div>
);

const HowToUseSection = () => (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center gradient-text">如何使用</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StepCard
                    number="1"
                    title="输入关键词"
                    description="在搜索框中输入您想了解的主题或问题。"
                />
                <StepCard
                    number="2"
                    title="选择数据源"
                    description="选择您想搜索的平台，如小红书、抖音等。"
                />
                <StepCard
                    number="3"
                    title="获取洞察"
                    description="查看搜索结果，获取全面的信息和深度洞察。"
                />
            </div>
        </div>
    </section>
);

const StepCard = ({ number, title, description }) => (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
        <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">{number}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const StatsSection = () => (
    <section className="py-20 bg-blue-500 text-white">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                    <h3 className="text-4xl font-bold mb-2">1000万+</h3>
                    <p className="text-xl">每日搜索量</p>
                </div>
                <div>
                    <h3 className="text-4xl font-bold mb-2">99.9%</h3>
                    <p className="text-xl">准确率</p>
                </div>
                <div>
                    <h3 className="text-4xl font-bold mb-2">50+</h3>
                    <p className="text-xl">数据源</p>
                </div>
            </div>
        </div>
    </section>
);

const TestimonialSection = () => (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center gradient-text">用户评价</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <TestimonialCard
                    name="张三"
                    role="市场分析师"
                    content="这个搜索工具大大提高了我的工作效率，让我能够快速获取市场动态和竞品信息。"
                />
                <TestimonialCard
                    name="李四"
                    role="内容创作者"
                    content="多平台数据整合的功能太棒了！我可以轻松了解各个平台的热门话题，为我的创作提供了很多灵感。"
                />
                <TestimonialCard
                    name="王五"
                    role="电商运营"
                    content="实时分析功能帮助我及时把握市场趋势，调整运营策略。这个工具现在是我日常工作中不可或缺的一部分。"
                />
            </div>
        </div>
    </section>
);

const TestimonialCard = ({ name, role, content }) => (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-4">{content}</p>
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-gray-500">{role}</div>
    </div>
);

const FeatureCard = ({ title, description, icon }) => (
    <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div className="text-4xl mb-6 text-blue-500">{icon}</div>
        <h3 className="text-2xl font-semibold mb-4">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const FAQSection = () => (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center gradient-text">常见问题</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FAQItem 
                    question="如何开始使用这个搜索工具？" 
                    answer="只需在搜索框中输入您的问题或关键词，然后点击搜索按钮。我们的AI系统会为您提供最相关的答案和信息。"
                />
                <FAQItem 
                    question="搜索结果来自哪些平台？" 
                    answer="我们目前整合了小红书和抖音的数据。未来我们计划扩展到更多的社交媒体和内容平台。"
                />
                <FAQItem 
                    question="如何提高搜索结果的准确性？" 
                    answer="尽量使用具体和清晰的关键词。您也可以使用高级搜索功能，如指定时间范围或特定平台，以获得更精准的结果。"
                />
                <FAQItem 
                    question="个人数据安全如何保障？" 
                    answer="我们非常重视用户隐私。所有的搜索记录和个人信息都经过加密处理，并且不会被分享给第三方。"
                />
            </div>
        </div>
    </section>
);

const FAQItem = ({ question, answer }) => (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
        <h3 className="text-xl font-semibold mb-3">{question}</h3>
        <p className="text-gray-600">{answer}</p>
    </div>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const DataIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
);

const AnalyticsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const RecommendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18S13.168 18.477 12 19.253" />
    </svg>
);

window.HomePage = HomePage;