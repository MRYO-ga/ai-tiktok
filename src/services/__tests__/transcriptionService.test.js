const { convertAndTranscribe } = require('../transcriptionService');
const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const { OPEN_AI_KEY } = require('../../config');

// 模拟puppeteer
jest.mock('puppeteer-core', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      goto: jest.fn().mockResolvedValue(),
      evaluate: jest.fn().mockResolvedValue('mocked video url'),
      close: jest.fn().mockResolvedValue()
    }),
    close: jest.fn().mockResolvedValue()
  })
}));

// 模拟fs
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn().mockResolvedValue(),
    readFile: jest.fn().mockResolvedValue(Buffer.from('test audio content')),
    unlink: jest.fn().mockResolvedValue()
  }
}));

// 模拟ffmpeg
jest.mock('fluent-ffmpeg', () => {
  return jest.fn().mockReturnValue({
    noVideo: jest.fn().mockReturnThis(),
    audioCodec: jest.fn().mockReturnThis(),
    audioBitrate: jest.fn().mockReturnThis(),
    on: jest.fn().mockImplementation(function(event, callback) {
      if (event === 'end') {
        callback();
      }
      return this;
    }),
    save: jest.fn().mockImplementation((outputPath, callback) => {
      callback();
    })
  });
});

jest.mock('axios');
jest.mock('../../config', () => ({
  OPEN_AI_KEY: 'test_api_key'
}));

// 模拟form-data
jest.mock('form-data', () => {
  return jest.fn().mockImplementation(() => ({
    append: jest.fn(),
    getHeaders: jest.fn().mockReturnValue({})
  }));
});

jest.mock('../../config/constants', () => ({
  BASE_URL: 'http://test-api-url.com',
  OPEN_AI_KEY: 'test_api_key'
}));

describe('convertAndTranscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该成功转换和转录视频', async () => {
    const mockFile = {
      buffer: Buffer.from('test video content'),
      originalname: 'test.mp4'
    };

    axios.post.mockResolvedValue({
      data: {
        text: 'This is a test transcription.',
        segments: [
          { start: 0, end: 1, text: 'This is' },
          { start: 1, end: 2, text: 'a test' },
          { start: 2, end: 3, text: 'transcription.' }
        ]
      }
    });

    const result = await convertAndTranscribe(mockFile);

    expect(result).toEqual({
      text: 'This is a test transcription.',
      paragraphs: [
        { start: 0, end: 3, text: 'This is a test transcription.' }
      ]
    });

    expect(fs.writeFile).toHaveBeenCalled();
    expect(ffmpeg).toHaveBeenCalled();
    expect(fs.readFile).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.openai.com/v1/audio/transcriptions',
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${OPEN_AI_KEY}`
        })
      })
    );
    expect(fs.unlink).toHaveBeenCalledTimes(2);
  });

  it('应该处理转换错误', async () => {
    const mockFile = {
      buffer: Buffer.from('test video content'),
      originalname: 'test.mp4'
    };

    ffmpeg.mockReturnValue({
      noVideo: jest.fn().mockReturnThis(),
      audioCodec: jest.fn().mockReturnThis(),
      audioBitrate: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation(function(event, callback) {
        if (event === 'error') {
          callback(new Error('Conversion error'));
        }
        return this;
      }),
      save: jest.fn()
    });

    await expect(convertAndTranscribe(mockFile)).rejects.toThrow('Conversion error');
  });
});

jest.unmock('puppeteer');
jest.unmock('form-data');
// 添加其他可能需要取消模拟的模块