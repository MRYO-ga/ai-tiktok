const React = window.React;
const { useState, useCallback, useEffect, useRef } = React;
const MarkdownRenderer = window.MarkdownRenderer;

const AnnotatedChatMessage = ({ content, videoData }) => {
    const [tooltip, setTooltip] = useState(null);
    const tooltipRef = useRef(null);
    const containerRef = useRef(null);

    const handleAnnotation = useCallback((videoIndex, type, contentIndex, event, start, end) => {
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
        const containerRect = containerRef.current.getBoundingClientRect();

        setTooltip({
            content: tooltipContent,
            x: rect.left - containerRect.left,
            y: rect.bottom - containerRect.top
        });
    }, [videoData]);

    const closeTooltip = useCallback(() => {
        setTooltip(null);
    }, []);

    const renderAnnotatedContent = useCallback(() => {
        const annotationRegex = /(\[indexAudio:(\d+), start:(\d+(\.\d+)?), end:(\d+(\.\d+)?)\]|\[indexAudio:(\d+), commentIndex:(\d+)\])/g;
        let lastIndex = 0;
        let parts = [];

        content.replace(annotationRegex, (match, fullMatch, audioIndex, start, _, end, __, commentVideoIndex, commentIndex, offset) => {
            parts.push(content.slice(lastIndex, offset));

            let contentIndex, annotationType, videoIndex, displayText;

            if (audioIndex) {
                annotationType = 'audio';
                videoIndex = parseInt(audioIndex);
                contentIndex = 0;
                displayText = videoIndex;
            } else {
                annotationType = 'comment';
                videoIndex = parseInt(commentVideoIndex);
                contentIndex = parseInt(commentIndex) - 1;
                displayText = `${videoIndex}-${contentIndex + 1}`;
            }

            parts.push(`<span class="inline-flex items-center justify-center w-auto h-6 px-2 bg-blue-200 text-blue-800 rounded-full cursor-pointer annotation-span" data-video-index="${videoIndex}" data-type="${annotationType}" data-content-index="${contentIndex}" data-start="${start}" data-end="${end}">${displayText}</span>`);

            lastIndex = offset + match.length;
        });

        parts.push(content.slice(lastIndex));

        // 修复句号和数字的顺序
        return parts.join('').replace(/(\d+)(\.)/, '$2$1');
    }, [content]);

    const handleInteraction = useCallback((event) => {
        const target = event.target.closest('.annotation-span');
        if (target) {
            const { videoIndex, type, contentIndex, start, end } = target.dataset;
            handleAnnotation(
                parseInt(videoIndex),
                type,
                parseInt(contentIndex),
                event,
                parseFloat(start),
                parseFloat(end)
            );
        }
    }, [handleAnnotation]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                closeTooltip();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeTooltip]);

    return (
        <div 
            ref={containerRef}
            className="relative" 
            onClick={handleInteraction}
            style={{ overflowX: 'hidden' }}
        >
            <MarkdownRenderer content={renderAnnotatedContent()} />
            {tooltip && (
                <div
                    ref={tooltipRef}
                    className="absolute bg-blue-50 border border-blue-200 p-2 rounded shadow-lg z-10"
                    style={{ 
                        left: `${tooltip.x}px`, 
                        top: `${tooltip.y}px`, 
                        maxWidth: '300px', 
                        maxHeight: '200px', 
                        overflow: 'auto',
                        wordWrap: 'break-word'
                    }}
                >
                    <button onClick={closeTooltip} className="float-right text-gray-500 hover:text-gray-700">&times;</button>
                    <p>{tooltip.content}</p>
                </div>
            )}
        </div>
    );
};

window.AnnotatedChatMessage = AnnotatedChatMessage;