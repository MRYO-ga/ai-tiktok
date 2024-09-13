const VideoUploader = ({ handleVideoUpload, fileInputKey }) => (
    <div className="mb-10">
        <h3 className="text-2xl font-semibold text-blue-700 mb-6">上传视频：</h3>
        <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
            id="video-upload"
            key={fileInputKey}
        />
        <label 
            htmlFor="video-upload" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full cursor-pointer transition-all duration-300 inline-block"
        >
            选择视频文件
        </label>
    </div>
);

window.VideoUploader = VideoUploader;