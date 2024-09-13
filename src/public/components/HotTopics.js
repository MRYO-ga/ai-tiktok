const { useState, useEffect } = React;
const axios = window.axios;

const HotTopics = ({ handleSearch }) => {
    const [hotTopics, setHotTopics] = useState([]);
    const [lastHotTopicsUpdate, setLastHotTopicsUpdate] = useState(null);

    const BASE_URL = 'http://localhost:3000/api';

    useEffect(() => {
        fetchHotTopics();
    }, []);

    const fetchHotTopics = async () => {
        const now = new Date();
        if (!lastHotTopicsUpdate || (now - lastHotTopicsUpdate) > 3600000) {
            console.log("开始获取热门话题");
            await generateHotTopics();
            setLastHotTopicsUpdate(now);
        }
    };

    const generateHotTopics = async () => {
        try {
            console.log("正在生成热门话题");
            const response = await axios.post(`${BASE_URL}/chat`, {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "你是一个AI助手，请生成5个当前热门的视频相关话题。" },
                    { role: "user", content: "请生成5个当前热门的视频相关话题。" }
                ],
                max_tokens: 150
            });

            console.log("成功获取热门话题:", response.data);
            const topics = response.data.choices[0].message.content.split('\n').filter(topic => topic.trim() !== '');
            console.log("处理后的热门话题:", topics);
            setHotTopics(topics);
        } catch (error) {
            console.error('生成热点问题时出错:', error);
            if (error.response) {
                console.error('错误响应:', error.response.data);
                console.error('错误状态码:', error.response.status);
            }
            console.error('生成热门话题失败，使用默认话题');
            setHotTopics(["最新病毒视频有哪些？", "如何制作吸引人的短视频？", "AI换脸技术在视频中的应用趋势是什么？"]);
        }
    };

    return (
        <div className="mb-10">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">热门搜索</h3>
            <div className="flex flex-wrap gap-3">
                {hotTopics.map((topic, index) => (
                    <button
                        key={index}
                        onClick={() => handleSearch(topic, true)}
                        className="hot-topic-button"
                    >
                        {topic}
                    </button>
                ))}
            </div>
        </div>
    );
};

window.HotTopics = HotTopics;
