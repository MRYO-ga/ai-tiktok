const VideoUrlInput = ({ videoUrl, setVideoUrl, handleVideoUrl, isLoading }) => (
    <div className="mb-10">
        <h3 className="text-2xl font-semibold text-blue-700 mb-6">输入视频URL：</h3>
        <div className="flex">
            <input
                type="text"
                className="input-field flex-1 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 py-3 px-6 transition-all duration-300"
                placeholder="输入视频URL..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
            />
            <button
                onClick={() => handleVideoUrl(videoUrl)}
                className="button rounded-r-full hover:bg-blue-600 transition-all duration-300 bg-blue-500 text-white px-8"
                disabled={isLoading}
            >
                处理视频URL
            </button>
        </div>
    </div>
);

window.VideoUrlInput = VideoUrlInput;