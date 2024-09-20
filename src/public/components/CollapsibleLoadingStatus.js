const React = window.React;
const { useState } = React;

const CollapsibleLoadingStatus = ({ statuses, isAllCompleted }) => {
    const [isExpanded, setIsExpanded] = useState(true);

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
                                <div key={index} className="flex items-start p-2 bg-white rounded-lg">
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