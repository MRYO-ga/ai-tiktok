const AboutPage = () => (
    <div className="container mx-auto px-4 py-16 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-5xl font-bold mb-12 text-center gradient-text">关于我们</h1>
        <div className="card p-8 mb-12 text-center bg-white rounded-lg shadow-lg">
            <p className="text-xl mb-6 text-gray-700 leading-relaxed">我们是一家致力于将AI技术应用于信息检索的创新公司。我们的目标是为用户提供最相关、最有价值的信息,彻底改变人们获取和处理信息的方式。</p>
            <p className="text-xl text-gray-700 leading-relaxed">通过整合多个平台的数据源,结合先进的AI算法,我们能够为用户提供全面而精准的搜索结果,助力用户在信息海洋中找到真正有价值的内容。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
    </div>
);

const MissionVisionCard = ({ title, description, icon }) => (
    <div className="card p-8 hover:shadow-lg transition-all duration-300 bg-white rounded-lg">
        <div className="flex items-center mb-4">
            <div className="text-4xl text-blue-500 mr-4">{icon}</div>
            <h3 className="text-2xl font-semibold gradient-text">{title}</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">{description}</p>
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

window.AboutPage = AboutPage;