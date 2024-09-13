const EvidenceDisplay = ({ conversations, selectedEvidence, transcriptionParagraphs, renderEvidenceDetails, renderTranscriptionWithTimestamps }) => (
    <div className="w-1/3 p-4 bg-gray-100 overflow-auto">
        {conversations.length > 0 && conversations[conversations.length - 1].length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
                {conversations[conversations.length - 1][conversations[conversations.length - 1].length - 1].isVideoSearch ? (
                    // 如果是视频搜索,始终显示视频转录
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