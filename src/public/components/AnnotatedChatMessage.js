const React = window.React;
const { useState } = React;
const MarkdownRenderer = window.MarkdownRenderer;

const AnnotatedChatMessage = ({ content, videoData }) => {
    const [tooltip, setTooltip] = useState(null);

    const handleAnnotationClick = (videoIndex, type, contentIndex, event, start, end) => {
        if (!videoData || videoIndex >= videoData.length) {
            console.error(`Invalid videoIndex: ${videoIndex}`);
            return;
        }

        const video = videoData[videoIndex];
        let tooltipContent;

        if (type === 'audio') {
            if (!video.transcriptionParagraphs) {
                console.error(`No transcriptionParagraphs for video at index ${videoIndex}`);
                tooltipContent = "转录文本不可用";
            } else {
                const relevantParagraphs = video.transcriptionParagraphs.filter(p => 
                    (p.start >= start && p.start < end) || (p.end > start && p.end <= end)
                );
                tooltipContent = relevantParagraphs.map(p => p.text).join(' ');
            }
        } else if (type === 'comment') {
            if (!video.comments || contentIndex >= video.comments.length) {
                console.error(`Invalid comment index ${contentIndex} for video at index ${videoIndex}`);
                tooltipContent = "评论不可用";
            } else {
                tooltipContent = video.comments[contentIndex].text;
            }
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
        let lastIndex = 0;
        let parts = [];

        content.replace(annotationRegex, (match, fullMatch, audioIndex, start, _, end, __, commentVideoIndex, commentIndex, offset) => {
            parts.push(content.slice(lastIndex, offset));

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

            parts.push(`<span class="text-blue-500 cursor-pointer hover:underline" data-video-index="${videoIndex}" data-type="${annotationType}" data-content-index="${contentIndex}" data-start="${start}" data-end="${end}">${match}</span>`);

            lastIndex = offset + match.length;
        });

        parts.push(content.slice(lastIndex));

        return parts.join('');
    };

    const handleClick = (event) => {
        const target = event.target;
        if (target.tagName === 'SPAN' && target.classList.contains('text-blue-500')) {
            const { videoIndex, type, contentIndex, start, end } = target.dataset;
            handleAnnotationClick(
                parseInt(videoIndex),
                type,
                parseInt(contentIndex),
                event,
                parseFloat(start),
                parseFloat(end)
            );
        }
    };

    return (
        <div className="relative" onClick={handleClick}>
            <MarkdownRenderer content={renderAnnotatedContent()} />
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

window.AnnotatedChatMessage = AnnotatedChatMessage;