const EvidenceDisplay = ({ conversations, selectedEvidence, transcriptionParagraphs, renderEvidenceDetails, renderTranscriptionWithTimestamps, videoData }) => (
    <div className="w-1/3 p-4 bg-gray-100 overflow-auto">
        {conversations.length > 0 && conversations[conversations.length - 1].length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
                {videoData ? (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">视频信息</h3>
                        {videoData.map((video, index) => (
                            <div key={index} className="mb-6 border-b pb-4">
                                <img src={video.coverImage} alt={video.title} className="w-full mb-2 rounded" />
                                <h4 className="text-xl font-semibold mb-2">{video.title}</h4>
                                <p className="text-gray-600 mb-2">点赞数: {video.likes}</p>
                                <p className="text-gray-700 mb-2">{video.summary}</p>
                                <h5 className="text-lg font-semibold mb-2">重要评论:</h5>
                                {video.topComments.map((comment, commentIndex) => (
                                    <div key={commentIndex} className="mb-2">
                                        <p className="text-gray-800">{comment.user}: {comment.content}</p>
                                        <p className="text-gray-600 text-sm">点赞数: {comment.likes}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : conversations[conversations.length - 1][conversations[conversations.length - 1].length - 1].isVideoSearch ? (
                    // 如果是视频搜索,显示视频转录
                    transcriptionParagraphs && transcriptionParagraphs.length > 0 ? (
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">视频转录</h3>
                            <div className="bg-gray-50 rounded-lg p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {renderTranscriptionWithTimestamps()}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-500 text-lg">视频转录正在处理中...</p>
                        </div>
                    )
                ) : (
                    // 如果不是视频搜索,显示证据详情
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
        )}
    </div>
);

window.EvidenceDisplay = EvidenceDisplay;