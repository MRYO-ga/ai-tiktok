const VideoPlayer = ({ videoFile }) => {
    const [videoUrl, setVideoUrl] = React.useState(null);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const videoRef = React.useRef(null);

    React.useEffect(() => {
        console.log("VideoPlayer 组件挂载或更新, videoFile:", videoFile);
        if (videoFile) {
            const url = URL.createObjectURL(videoFile);
            setVideoUrl(url);
            console.log("创建了视频 URL:", url);
        }
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
                console.log("释放视频 URL");
            }
        };
    }, [videoFile]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            console.log("视频元数据加载完成,时长:", videoRef.current.duration);
        }
    };

    const handleSliderChange = (e) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    console.log("VideoPlayer 渲染, videoUrl:", videoUrl);

    // 添加 formatTime 函数
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">上传的视频：</h3>
            {videoUrl ? (
                <div>
                    <video 
                        ref={videoRef}
                        controls 
                        className="w-full max-w-lg mx-auto rounded-lg shadow-lg mb-4"
                        src={videoUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onError={(e) => console.error("视频加载错误:", e)}
                        onCanPlay={() => console.log("视频可以开始播放")}
                    >
                        您的浏览器不支持 HTML5 视频。
                    </video>
                    <div className="w-full max-w-lg mx-auto">
                        <input 
                            type="range"
                            min="0"
                            max={duration}
                            value={currentTime}
                            onChange={handleSliderChange}
                            className="w-full"
                        />
                        <div className="flex justify-between text-white text-sm">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-white">视频正在加载中...</p>
            )}
        </div>
    );
};

window.VideoPlayer = VideoPlayer;