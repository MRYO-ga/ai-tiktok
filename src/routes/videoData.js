const express = require('express');
const router = express.Router();

router.get('/get-video-data', (req, res) => {
    // 模拟视频数据
    const mockVideoData = [
        {
            url: 'https://www.example.com/watch?v=dQw4w9WgXcQ',
            coverImage: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
            title: '2023年最火爆的AI应用大盘点',
            likes: 156789,
            views: 2345678,
            uploadDate: '2023-05-15',
            duration: '15:23',
            summary: '本视频详细介绍了2023年最受欢迎的AI应用,包括ChatGPT、DALL-E 2、Midjourney等。视频分析了这些应用的特点、优势以及对各行各业的潜在影响。',
            topComments: [
                { user: 'AI爱好者', content: '太棒了!这个视频让我对AI的未来更加期待了。', likes: 3205, replies: 89 },
                { user: '科技达人', content: '视频制作很精良,内容也很全面。不过我觉得还可以多讲讲AI在医疗领域的应用。', likes: 2103, replies: 56 },
                { user: '小白学习中', content: '作为AI小白,看完这个视频收获很大,谢谢UP主!', likes: 1876, replies: 23 }
            ]
        },
        {
            url: 'https://www.example.com/watch?v=xC-c7E5PK0Y',
            coverImage: 'https://i.ytimg.com/vi/xC-c7E5PK0Y/hqdefault.jpg',
            title: '5分钟学会使用Stable Diffusion生成惊艳图片',
            likes: 98765,
            views: 1234567,
            uploadDate: '2023-06-02',
            duration: '5:47',
            summary: '本教程简单明了地介绍了如何使用Stable Diffusion生成高质量图片。视频包括软件安装、基本操作、提示词编写技巧等内容,适合AI绘画初学者。',
            topComments: [
                { user: '绘画爱好者', content: '哇,按照视频操作真的生成了很棒的图片!感谢分享!', likes: 2765, replies: 45 },
                { user: 'AI艺术家', content: '提示词的技巧很有用,但是建议可以再多介绍一些进阶技巧。', likes: 1543, replies: 28 },
                { user: '新手小白', content: '视频节奏很适合新手,一步步跟着做很容易上手。', likes: 1298, replies: 17 }
            ]
        },
        {
            url: 'https://www.example.com/watch?v=bMknfKXIFA8',
            coverImage: 'https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg',
            title: 'AI革命：未来10年工作市场将如何改变?',
            likes: 203456,
            views: 3456789,
            uploadDate: '2023-04-28',
            duration: '22:15',
            summary: '本视频深入探讨了AI技术对未来10年工作市场的潜在影响。内容涵盖了可能消失的工作、新兴的职业机会,以及如何为AI时代做好准备等方面。',
            topComments: [
                { user: '职场达人', content: '分析很到位,确实需要未雨绸缪,提前为AI时代做好准备。', likes: 5678, replies: 134 },
                { user: '科技评论员', content: '虽然分析很全面,但我觉得对AI的影响可能有些夸大了。人类的创造力是无可替代的。', likes: 3456, replies: 98 },
                { user: '在校学生', content: '看完这个视频,我对自己的职业规划有了新的思考。非常感谢!', likes: 2345, replies: 45 }
            ]
        }
    ];

    res.json(mockVideoData);
});

module.exports = router;