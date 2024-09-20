const React = window.React;
const { useState } = React;

const AnnotatedContent = ({ content, videoData }) => {
    const [tooltip, setTooltip] = useState(null);

    const handleAnnotationClick = (videoIndex, type, contentIndex, event, start, end) => {
        const video = videoData[videoIndex];
        let tooltipContent;

        if (type === 'audio') {
            // 找到对应的预处理前的转录文本
            const relevantParagraphs = video.transcriptionParagraphs.filter(p => 
                (p.start >= start && p.start < end) || (p.end > start && p.end <= end)
            );
            tooltipContent = relevantParagraphs.map(p => p.text).join(' ');
        } else if (type === 'comment') {
            tooltipContent = video.comments[contentIndex].text;
        } else {
            tooltipContent = "无法显示内容";
        }
        
        const rect = event.target.getBoundingClientRect();
        setTooltip({
            content: tooltipContent,
            x: rect.left + window.scrollX,
            y: rect.bottom + window.scrollY
        });
    };

    const closeTooltip = () => {
        setTooltip(null);
    };

    const renderAnnotatedContent = () => {
        const annotationRegex = /(\[indexAudio:(\d+), start:(\d+(\.\d+)?), end:(\d+(\.\d+)?)\]|\[indexAudio:(\d+), commentIndex:(\d+)\])/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = annotationRegex.exec(content)) !== null) {
            const [fullMatch, , audioIndex, start, , end, , commentVideoIndex, commentIndex] = match;
            let contentIndex, annotationType, videoIndex;

            if (audioIndex) {
                annotationType = 'audio';
                videoIndex = parseInt(audioIndex);
                contentIndex = 0;
            } else {
                annotationType = 'comment';
                videoIndex = parseInt(commentVideoIndex);
                contentIndex = parseInt(commentIndex) - 1;
            }

            parts.push(content.slice(lastIndex, match.index));
            parts.push(
                <span
                    key={match.index}
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={(e) => handleAnnotationClick(videoIndex, annotationType, contentIndex, e, parseFloat(start), parseFloat(end))}
                >
                    {fullMatch}
                </span>
            );
            lastIndex = match.index + fullMatch.length;
        }
        parts.push(content.slice(lastIndex));

        return parts;
    };

    return (
        <div className="relative">
            <p>{renderAnnotatedContent()}</p>
            {tooltip && (
                <div
                    className="absolute bg-white border border-gray-300 p-2 rounded shadow-lg z-10"
                    style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px`, maxWidth: '300px', maxHeight: '200px', overflow: 'auto' }}
                >
                    <button onClick={closeTooltip} className="float-right text-gray-500 hover:text-gray-700">&times;</button>
                    <p>{tooltip.content}</p>
                </div>
            )}
        </div>
    );
};

window.AnnotatedContent = AnnotatedContent;