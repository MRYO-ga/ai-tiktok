
const transcribeVideo = async (result) => {
    const audioUrl = result.music_url;
    console.log("处理视频转录audioUrl:", audioUrl);

    try {
        // 等待转录完成
        const transcriptionResult = await window.openaiService.transcribeAudio(audioUrl);
        console.log("转录完成:", transcriptionResult);
        return {
            ...result,
            transcription: transcriptionResult.text,
            transcriptionParagraphs: transcriptionResult.paragraphs
        };
    } catch (error) {
        console.error("处理视频转录失败:", error);
        return {
            ...result,
            transcription: "音频转换失败",
            transcriptionParagraphs: []
        };
    }
}

// 将函数挂载到window对象上
window.transcribeVideo = transcribeVideo;
