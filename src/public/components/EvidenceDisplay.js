const EvidenceDisplay = ({ conversations, selectedEvidence, transcriptionParagraphs, renderEvidenceDetails, renderTranscriptionWithTimestamps, videoData }) => {
	const latestConversation = conversations[conversations.length - 1];
	const latestResult = latestConversation[latestConversation.length - 1];

	const renderVideoDetails = (video) => (
		<div key={video.id} className="mb-6 bg-white rounded-lg shadow-md p-4">
			<img 
				src={video.dynamic_cover || video.origin_cover} 
				alt={video.desc}
				className="w-full h-48 object-cover rounded-t-lg"
				onError={(e) => {
					e.target.onerror = null;
					e.target.src = '/path/to/fallback/image.jpg'; // 替换为默认图片路径
				}}
			/>
			<h4 className="text-lg font-semibold mt-2">{video.desc}</h4>
			<p className="text-sm text-gray-600">作者: {video.nickname}</p>
			{/* <p className="text-sm text-gray-600">抖音号: {video.unique_id}</p> */}
			<p className="text-sm text-gray-600">发布时间: {new Date(video.create_time * 1000).toLocaleString()}</p>
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
			{/* <p className="text-sm text-gray-600">分辨率: {video.width}x{video.height}</p> */}
			{/* <p className="text-sm text-gray-600">音乐: {video.music_author} - {video.music_title}</p> */}
			{/* {video.tag_1 && <p className="text-sm text-gray-600">标签1: {video.tag_1}</p>}
			{video.tag_2 && <p className="text-sm text-gray-600">标签2: {video.tag_2}</p>}
			{video.tag_3 && <p className="text-sm text-gray-600">标签3: {video.tag_3}</p>} */}
			{video.transcription && (
				<div className="mt-2">
					<h5 className="font-semibold">转录文本:</h5>
					<p className="text-sm">{video.transcription}</p>
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

	return (
		<div className="w-1/3 p-4 bg-gray-100 overflow-y-auto">
			{latestResult.isVideoSearch ? (
				latestResult.videoData && latestResult.videoData.length > 0 ? (
					<div>
						<h3 className="text-2xl font-bold text-gray-800 mb-4">视频详情</h3>
						<div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
							{latestResult.videoData.map(renderVideoDetails)}
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