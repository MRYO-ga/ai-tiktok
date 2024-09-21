const EvidenceDisplay = ({ conversations, selectedEvidence, transcriptionParagraphs, renderEvidenceDetails, renderTranscriptionWithTimestamps, videoData }) => {
    const [showParagraphs, setShowParagraphs] = useState({});
    const latestConversation = conversations[conversations.length - 1];
    const latestResult = latestConversation[latestConversation.length - 1];

    const renderVideoDetails = (video) => {
        const getSummary = (preprocessedTranscription) => {
            if (preprocessedTranscription === '<不相关>') return '';
            const summaryMatch = preprocessedTranscription.match(/文章总结：([\s\S]*?)$/);
            return summaryMatch ? summaryMatch[1].trim() : '';
        };

        return (
            <div key={video.id} className="mb-6 bg-white rounded-lg shadow-md p-4">
                <a href={video.share_url} target="_blank" rel="noopener noreferrer" className="block">
                    <img 
                        src={video.dynamic_cover || video.origin_cover} 
                        alt={video.desc}
                        className="w-full h-48 object-cover rounded-t-lg hover:opacity-80 transition-opacity"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/path/to/fallback/image.jpg';
                        }}
                    />
                    <h4 className="text-base font-semibold mt-2 truncate text-blue-600 hover:underline" title={video.desc}>{video.desc}</h4>
                </a>
                <p className="text-sm text-gray-600">作者: {video.nickname}</p>
                <p className="text-sm text-gray-600">发布时间: {video.create_time || '未知'}</p>
                <div className="mt-2 text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="font-semibold">点赞:</span> {video.digg_count}
                        </div>
                        <div>
                            <span className="font-semibold">评论:</span> {video.comment_count}
                        </div>
                        <div>
                            <span className="font-semibold">收藏:</span> {video.collect_count}
                        </div>
                        <div>
                            <span className="font-semibold">分享:</span> {video.share_count}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">时长: {video.duration}</p>

                <p className="text-sm text-gray-500 mt-2">{getSummary(video.preprocessedTranscription)}</p>

                <button 
                    onClick={() => setShowParagraphs(prev => ({...prev, [video.id]: !prev[video.id]}))}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    {showParagraphs[video.id] ? "隐藏分段文本" : "显示分段文本"}
                </button>

                {showParagraphs[video.id] && video.transcriptionParagraphs && (
                    <div className="mt-4">
                        <h5 className="text-lg font-semibold mb-2">分段文本:</h5>
                        {video.transcriptionParagraphs.map((paragraph, index) => (
                            <p key={index} className="mb-2">
                                <span className="font-semibold">[{formatTime(paragraph.start)} - {formatTime(paragraph.end)}]</span> {paragraph.text}
                            </p>
                        ))}
                    </div>
                )}

                {video.comments && video.comments.length > 0 && (
                    <div className="mt-2">
                        <h5 className="font-semibold">重要评论:</h5>
                        <ul className="list-disc pl-5">
                            {video.comments.slice(0, 3).map((comment, index) => (
                                <li key={index} className="text-sm">
                                    <p>{comment.text}</p>
                                    <p className="text-xs text-gray-500">
                                        by {comment.nickname} | 点赞: {comment.digg_count} | IP: {comment.ip_label}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-1/3 p-4 bg-gray-100 overflow-y-auto">
            {latestResult && latestResult.isVideoSearch ? (
                latestResult.videoData && latestResult.videoData.length > 0 ? (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">视频详情</h3>
                        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {latestResult.videoData.slice(0, latestResult.processedVideoCount || 3).map(renderVideoDetails)}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500 text-lg">没有可用的视频信息</p>
                    </div>
                )
            ) : (
                selectedEvidence && (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">依据详情</h3>
                        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {selectedEvidence.map((evidence, index) => renderEvidenceDetails(evidence, index))}
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

window.EvidenceDisplay = EvidenceDisplay;