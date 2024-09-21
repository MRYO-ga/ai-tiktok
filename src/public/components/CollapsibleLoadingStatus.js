const React = window.React;
const { useState } = React;

const CollapsibleLoadingStatus = ({ 
    statuses, 
    isAllCompleted, 
    fullIntent,
    onSubIntentChange,
    onRegenerateAnswer
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const renderSubIntents = () => {
        if (!fullIntent || !fullIntent.subIntents) return null;

        const hasChanges = fullIntent.subIntents.some(si => 
            si.selectedOptions && si.selectedOptions.length > 0 && 
            JSON.stringify(si.selectedOptions.sort()) !== JSON.stringify(si.options.slice(0, si.selectedOptions.length).sort())
        );

        return (
            <div className="mt-2 space-y-2">
                {fullIntent.subIntents.map((subIntent, index) => (
                    <div key={index} className="bg-white p-2 rounded-lg shadow-sm">
                        <h5 className="text-sm font-medium mb-1">{subIntent.intent}</h5>
                        {subIntent.options && subIntent.options.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {subIntent.options.map((option, optionIndex) => (
                                    <button
                                        key={optionIndex}
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            (subIntent.selectedOptions || []).includes(option)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                        onClick={() => onSubIntentChange(subIntent, option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-600">{subIntent.content || '暂无内容'}</p>
                        )}
                    </div>
                ))}
                <button 
                    className={`mt-2 w-full font-bold py-1 px-2 rounded text-sm focus:outline-none focus:shadow-outline ${
                        hasChanges
                            ? 'bg-blue-500 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={() => {
                        if (hasChanges) {
                            const allOptions = fullIntent.subIntents.map(si => ({
                                intent: si.intent,
                                selectedOptions: si.selectedOptions || si.options.slice(0, 1)
                            }));
                            console.log("所有选项:", allOptions);
                            onRegenerateAnswer(allOptions);
                        }
                    }}
                    disabled={!hasChanges}
                >
                    重新生成答案
                </button>
            </div>
        );
    };

    return (
        <div className="mt-4">
            <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">分步解决</span>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)} 
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                        {isExpanded ? "收起详情" : "查看详情"}
                    </button>
                </div>
                {isExpanded && (
                    <div className="space-y-2">
                        {statuses.map((status, index) => {
                            const [mainStatus, subStatus] = status.split(':');
                            const isCompleted = isAllCompleted || index < statuses.length - 1;
                            return (
                                <div key={index} className="flex flex-col p-2 bg-white rounded-lg">
                                    <div className="flex items-start">
                                        <div className={`w-6 h-6 rounded-full mr-2 mt-1 flex-shrink-0 flex items-center justify-center ${
                                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                        }`}>
                                            {isCompleted ? (
                                                <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            ) : (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium">{mainStatus}</span>
                                            {subStatus && (
                                                <p className="text-xs text-gray-600 mt-1 truncate" title={subStatus}>
                                                    {subStatus}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {mainStatus === '分析用户意图' && fullIntent && (
                                        <div className="mt-2 ml-8">
                                            {renderSubIntents()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// 将组件挂载到全局对象上
window.CollapsibleLoadingStatus = CollapsibleLoadingStatus;