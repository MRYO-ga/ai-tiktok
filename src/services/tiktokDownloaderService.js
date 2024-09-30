const axios = require('axios');
const { TIK_TOK_DOWNLOADER_API_URL } = require('../config');
const fs = require('fs').promises;
const path = require('path');

// 基础 API 调用函数
const callApi = async (endpoint, params = {}) => {
    try {
        const response = await axios.get(`${TIK_TOK_DOWNLOADER_API_URL}${endpoint}`, { params });
        return response.data;
    } catch (error) {
        console.error(`调用 API ${endpoint} 时出错:`, error);
        throw error;
    }
};

// 批量下载账号作品 (TikTok)
const downloadUserWorksTikTok = async (username) => {
    return callApi('/download_user_works_tiktok', { username });
};

// 批量下载账号作品 (抖音)
const downloadUserWorksDouyin = async (username) => {
    return callApi('/download_user_works_douyin', { username });
};

// 批量下载链接作品 (通用)
const downloadWorksByLinks = async (links) => {
    return callApi('/download_works_by_links', { links: links.join(',') });
};

// 获取直播推流地址 (抖音)
const getLiveStreamUrl = async (roomId) => {
    return callApi('/get_live_stream_url', { room_id: roomId });
};

// 采集作品评论数据 (抖音)
const getWorkComments = async (url, pages = 1, source = false, cookie = '', token = '') => {
    try {
        const response = await axios.post(`${TIK_TOK_DOWNLOADER_API_URL}/comment/`, {
            url,
            pages,
            source,
            cookie,
            token
        });
        // console.log('获取评论:', response.data);
        return response.data;
    } catch (error) {
        console.error('获取评论时出错:', error);
        throw error;
    }
};

// 批量下载合集作品 (抖音)
const downloadMixWorks = async (mixId) => {
    return callApi('/download_mix_works', { mix_id: mixId });
};

// 批量采集账号数据 (抖音)
const getUserData = async (username) => {
    return callApi('/get_user_data', { username });
};

// 采集搜索结果数据 (抖音)
const getSearchResults = async (keyword, type = '0', pages = '1', sort_type = '0', publish_time = '0') => {
    try {
        const response = await axios.post(`${TIK_TOK_DOWNLOADER_API_URL}/search/`, {
            keyword,
            type,
            pages,
            sort_type,
            publish_time
        });
        // 检查响应数据是否存在且包含data属性
        if (!response.data || !response.data.data) {
            console.error('搜索结果数据格式不正确');
            return [];
        }
        let results = response.data.data;
        
        // 根据不同的排序类型进行排序
        switch(sort_type) {
            case '1': // 按点赞数排序
                results.sort((a, b) => b.digg_count - a.digg_count);
                break;
            case '2': // 按评论数排序
                results.sort((a, b) => b.comment_count - a.comment_count);
                break;
            case '3': // 按收藏数排序
                results.sort((a, b) => b.collect_count - a.collect_count);
                break;
            case '4': // 按分享数排序
                results.sort((a, b) => b.share_count - a.share_count);
                break;
            case '5': // 按发布时间排序（假设create_time是时间戳）
                results.sort((a, b) => b.create_time - a.create_time);
                break;
            default:
                // 默认不排序
                break;
        }
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            return response.data.data
                .filter(item => {
                    // 过滤掉时长为0或大于3分钟的视频
                    const durationInSeconds = parseDuration(item.duration);
                    return durationInSeconds > 60 && durationInSeconds <= 180; 
                })
                .map(item => ({
                    type: item.type || '',
                    collection_time: new Date().toISOString(), // 当前时间作为采集时间
                    uid: item.uid || '',
                    sec_uid: item.sec_uid || '',
                    unique_id: item.unique_id || '',
                    short_id: item.short_id || '',
                    id: item.id || '',
                    desc: item.desc || '',
                    text_extra: item.text_extra || '',
                    duration: item.duration || '',
                    ratio: item.ratio || '',
                    height: item.height || 0,
                    width: item.width || 0,
                    share_url: item.share_url || '',
                    create_time: item.create_time || '',
                    uri: item.uri || '',
                    nickname: item.nickname || '',
                    user_age: item.user_age || 0,
                    signature: item.signature || '',
                    downloads: item.downloads || '',
                    music_author: item.music_author || '',
                    music_title: item.music_title || '',
                    music_url: item.music_url || '',
                    origin_cover: item.origin_cover || '',
                    dynamic_cover: item.dynamic_cover || '',
                    tag_1: item.tag_1 || '',
                    tag_2: item.tag_2 || '',
                    tag_3: item.tag_3 || '',
                    digg_count: item.digg_count || 0,
                    comment_count: item.comment_count || 0,
                    collect_count: item.collect_count || 0,
                    share_count: item.share_count || 0,
                    extra: item.extra || ''
                }));
        } else {
            console.error('意外的响应格式:', response.data);
            return [];
        }
        // 模拟搜索结果数据
        const simulateSearchResults = () => {
            return [{
                collect_count: "172",
                collection_time: new Date().toISOString(),
                comment_count: "60",
                create_time: "Invalid Date",
                desc: "两个人出国去趟澳洲旅游到底需要多少钱？这条澳洲旅游攻略告诉你答案~#澳洲 #澳大利亚 #澳洲旅游 #旅游推荐官",
                digg_count: "456",
                downloads: "http://v26-web.douyinvod.com/63476268b73f5bf47a78e91d83bd16df/66ed5a72/video/tos/cn/tos-cn-ve-15/o8DXQRxvA617AABeNeit1PXsBbBeaV8EC9ERMU/?a=6383&ch=11&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C3&cv=1&br=3403&bt=3403&cs=0&ds=4&ft=AJkeU_TLRR0si0C4kDn2Nc.xBiGNbLOBF2sU_4cx.VdSNv7TGW&mime_type=video_mp4&qs=0&rc=aTZpN2ZnOjZpZDo0Mzg2O0BpM3kzNng5cmpkdTMzNGkzM0BgMWI0MF8wNi8xX2NjLzMzYSNpamlpMmRjcmNgLS1kLWFzcw%3D%3D&btag=c0000e00028000&cquery=100o_101n_100B_100H_100K&dy_q=1726820323&feature_id=46a7bb47b4fd1280f3d3825bf2b29388&l=20240920161843F486E76833016F024710",
                duration: "00:01:35",
                dynamic_cover: "https://p9-pc-sign.douyinpic.com/obj/tos-cn-i-dy/26547a6e0d9443dc90edd6104a4ef145?x-expires=1728028800&x-signature=ouRCMTjsGgyTSl0gqdYaV4Cvaeo%3D&from=327834062_large&s=PackSourceEnum_SEARCH&se=false&sc=dynamic_cover&biz_tag=pcweb_cover&l=20240920161843F486E76833016F024710",
                extra: "",
                height: 1920,
                id: "7412555876260760868",
                music_author: "GoFun澳大利亚",
                music_title: "@GoFun澳大利亚创作的原声",
                music_url: "https://sf3-cdn-tos.douyinstatic.com/obj/ies-music/7412555917327190823.mp3",
                nickname: "GoFun澳大利亚",
                origin_cover: "https://p9-pc-sign.douyinpic.com/tos-cn-p-0015/o0ABBKf9foNQeCHR6OGVtQDZavY7I6LAX6gBU6~tplv-dy-360p.jpeg?x-expires=1728028800&x-signature=3v6mCmsZtlYHsLSbbPSTvFFq1u4%3D&from=327834062&s=PackSourceEnum_SEARCH&se=false&sc=origin_cover&biz_tag=pcweb_cover&l=20240920161843F486E76833016F024710",
                preprocessedTranscription: "转录文本与视频标题相关，以下是提取处理后的内容：\n\n- 出国去澳大利亚，计划11天的行程，包括：悉尼、凯恩斯、黄金海岸和墨尔本等地。\n  \n- 主要活动安排：\n  - 在悉尼体验Citywalk，游览地标建筑歌剧院、魔法学院悉尼大学和圣玛丽大教堂。\n  - 搭乘游船游览杰维斯湾，观察海豚并欣赏海洋风景。\n  \n- 转战凯恩斯，游览热带雨林，乘坐水陆两用车，感受原住民文化，同时参观库牛农场，亲密接触动物。\n\n- 乘坐豪华游轮前往大堡礁，欣赏珊瑚礁群，潜入海底世界，见识丰富的海洋生物。\n\n- 在布里斯班体验阳光，游览世界最长海岸线和冲浪者天堂，观赏电影世界的花车巡游。\n\n- 最后到达墨尔本，逛南半球最大的露天市场、涂鸦街和皇家植物园，并在菲利普岛观看企鹅归巢。\n\n- 结束行程前，进行大洋路自驾游，沿途欣赏绝美景观，最后在墨尔本市区购买纪念品。\n\n- 这样的11天行程，人均费用大约两万多元。",
                ratio: "1080p",
                sec_uid: "MS4wLjABAAAAzWZyTE60auRUn7QDQNpR0bGf_sZAkoosGzxXCKZobYtx054FOkXwCuqImAgM6kNd",
                share_count: "295",
                share_url: "https://www.douyin.com/video/7412555876260760868",
                short_id: "",
                signature: "",
                tag_1: "",
                tag_2: "",
                tag_3: "",
                text_extra: "澳洲, 澳大利亚, 澳洲旅游, 旅游推荐官",
                transcription: "两个人出国去趟澳大利亚 到底需要多少钱 价格我放最后了 11天时间打卡悉尼 凯恩斯 黄金海岸 墨尔本 体验出海观景 大洋路自驾 外宝交付钱 直接落地悉尼 开启Citywalk 打卡地标建筑歌剧院 闯入魔法学院悉尼大学 参观庄严的圣玛丽大教堂 再去感受下艺术的薰操 南半球最美火车站 当然也不能错过 搭乘游船出海杰维斯湾 邂逅调皮小海豚 亲眼见证庞然巨物跃出海面 去打卡海崖大桥 人生赵家一 转战凯恩斯 游览古老神秘的热带云 乘坐水陆两用车探险 感受原住民文化 参观库牛农场 与动物们来一场亲密接触 接着来到本次行程的重头戏 乘坐豪华游轮出海外宝礁 欣赏瑰丽的珊瑚礁群 潜入绚烂海底世界 邂逅丰富的海洋生物 再闪现布里斯班 去感受阳光之城的松驰 去看世界最长的海岸线 去打卡冲浪者天堂 去电影世界看花车巡游 最后去到浪漫之都墨尔本 逛逛南半球最大的露天市场 去满腹活力的涂鸦街 去浪漫的皇家植物园 傍晚去到菲利普岛 看可爱的企鹅归巢 最后的行程安排大洋路自驾 沿岸都是绝景奇观 夕阳下的十二史图檐 仿佛进入异域世界 最后墨尔本市区买买纪念品 结束行程 这样的十一天四程之旅 人均只要两万多 你肯定心动了吧",
                transcriptionParagraphs: Array(4).fill({}),
                type: "视频",
                uid: "3030728247613315",
                unique_id: "",
                uri: "v0d00fg10000crfaugfog65ul3l0mvl0",
                user_age: "-1",
                width: 1080
            },
            {
                collect_count: "172",
                collection_time: new Date().toISOString(),
                comment_count: "60",
                create_time: "Invalid Date",
                desc: "两个人出国去趟澳洲旅游到底需要多少钱？这条澳洲旅游攻略告诉你答案~#澳洲 #澳大利亚 #澳洲旅游 #旅游推荐官",
                digg_count: "456",
                downloads: "http://v26-web.douyinvod.com/63476268b73f5bf47a78e91d83bd16df/66ed5a72/video/tos/cn/tos-cn-ve-15/o8DXQRxvA617AABeNeit1PXsBbBeaV8EC9ERMU/?a=6383&ch=11&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C3&cv=1&br=3403&bt=3403&cs=0&ds=4&ft=AJkeU_TLRR0si0C4kDn2Nc.xBiGNbLOBF2sU_4cx.VdSNv7TGW&mime_type=video_mp4&qs=0&rc=aTZpN2ZnOjZpZDo0Mzg2O0BpM3kzNng5cmpkdTMzNGkzM0BgMWI0MF8wNi8xX2NjLzMzYSNpamlpMmRjcmNgLS1kLWFzcw%3D%3D&btag=c0000e00028000&cquery=100o_101n_100B_100H_100K&dy_q=1726820323&feature_id=46a7bb47b4fd1280f3d3825bf2b29388&l=20240920161843F486E76833016F024710",
                duration: "00:01:35",
                dynamic_cover: "https://p9-pc-sign.douyinpic.com/obj/tos-cn-i-dy/26547a6e0d9443dc90edd6104a4ef145?x-expires=1728028800&x-signature=ouRCMTjsGgyTSl0gqdYaV4Cvaeo%3D&from=327834062_large&s=PackSourceEnum_SEARCH&se=false&sc=dynamic_cover&biz_tag=pcweb_cover&l=20240920161843F486E76833016F024710",
                extra: "",
                height: 1920,
                id: "7412555876260760868",
                music_author: "GoFun澳大利亚",
                music_title: "@GoFun澳大利亚创作的原声",
                music_url: "https://sf3-cdn-tos.douyinstatic.com/obj/ies-music/7412555917327190823.mp3",
                nickname: "GoFun澳大利亚",
                origin_cover: "https://p9-pc-sign.douyinpic.com/tos-cn-p-0015/o0ABBKf9foNQeCHR6OGVtQDZavY7I6LAX6gBU6~tplv-dy-360p.jpeg?x-expires=1728028800&x-signature=3v6mCmsZtlYHsLSbbPSTvFFq1u4%3D&from=327834062&s=PackSourceEnum_SEARCH&se=false&sc=origin_cover&biz_tag=pcweb_cover&l=20240920161843F486E76833016F024710",
                preprocessedTranscription: "转录文本与视频标题相关，以下是提取处理后的内容：\n\n- 出国去澳大利亚，计划11天的行程，包括：悉尼、凯恩斯、黄金海岸和墨尔本等地。\n  \n- 主要活动安排：\n  - 在悉尼体验Citywalk，游览地标建筑歌剧院、魔法学院悉尼大学和圣玛丽大教堂。\n  - 搭乘游船游览杰维斯湾，观察海豚并欣赏海洋风景。\n  \n- 转战凯恩斯，游览热带雨林，乘坐水陆两用车，感受原住民文化，同时参观库牛农场，亲密接触动物。\n\n- 乘坐豪华游轮前往大堡礁，欣赏珊瑚礁群，潜入海底世界，见识丰富的海洋生物。\n\n- 在布里斯班体验阳光，游览世界最长海岸线和冲浪者天堂，观赏电影世界的花车巡游。\n\n- 最后到达墨尔本，逛南半球最大的露天市场、涂鸦街和皇家植物园，并在菲利普岛观看企鹅归巢。\n\n- 结束行程前，进行大洋路自驾游，沿途欣赏绝美景观，最后在墨尔本市区购买纪念品。\n\n- 这样的11天行程，人均费用大约两万多元。",
                ratio: "1080p",
                sec_uid: "MS4wLjABAAAAzWZyTE60auRUn7QDQNpR0bGf_sZAkoosGzxXCKZobYtx054FOkXwCuqImAgM6kNd",
                share_count: "295",
                share_url: "https://www.douyin.com/video/7412555876260760868",
                short_id: "",
                signature: "",
                tag_1: "",
                tag_2: "",
                tag_3: "",
                text_extra: "澳洲, 澳大利亚, 澳洲旅游, 旅游推荐官",
                transcription: "两个人出国去趟澳大利亚 到底需要多少钱 价格我放最后了 11天时间打卡悉尼 凯恩斯 黄金海岸 墨尔本 体验出海观景 大洋路自驾 外宝交付钱 直接落地悉尼 开启Citywalk 打卡地标建筑歌剧院 闯入魔法学院悉尼大学 参观庄严的圣玛丽大教堂 再去感受下艺术的薰操 南半球最美火车站 当然也不能错过 搭乘游船出海杰维斯湾 邂逅调皮小海豚 亲眼见证庞然巨物跃出海面 去打卡海崖大桥 人生赵家一 转战凯恩斯 游览古老神秘的热带云 乘坐水陆两用车探险 感受原住民文化 参观库牛农场 与动物们来一场亲密接触 接着来到本次行程的重头戏 乘坐豪华游轮出海外宝礁 欣赏瑰丽的珊瑚礁群 潜入绚烂海底世界 邂逅丰富的海洋生物 再闪现布里斯班 去感受阳光之城的松驰 去看世界最长的海岸线 去打卡冲浪者天堂 去电影世界看花车巡游 最后去到浪漫之都墨尔本 逛逛南半球最大的露天市场 去满腹活力的涂鸦街 去浪漫的皇家植物园 傍晚去到菲利普岛 看可爱的企鹅归巢 最后的行程安排大洋路自驾 沿岸都是绝景奇观 夕阳下的十二史图檐 仿佛进入异域世界 最后墨尔本市区买买纪念品 结束行程 这样的十一天四程之旅 人均只要两万多 你肯定心动了吧",
                transcriptionParagraphs: Array(4).fill({}),
                type: "视频",
                uid: "3030728247613315",
                unique_id: "",
                uri: "v0d00fg10000crfaugfog65ul3l0mvl0",
                user_age: "-1",
                width: 1080
            }];
        };

        // 使用模拟数据
        const simulatedResults = simulateSearchResults();
        // console.log("模拟搜索结果:", simulatedResults);
        return simulatedResults;
    } catch (error) {
        console.error('Error fetching search results:', error);
        throw error;
    }
};

// 辅助函数：将时长字符串转换为秒数
const parseDuration = (duration) => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else {
        return parts[0];
    }
};

// 获取音频URL
const getAudioUrl = async (downloadUrl) => {
    const response = await axios.get(downloadUrl);
    // 假设响应中包含音频URL,需要根据实际响应格式进行调整
    return response.data.audio_url;
};

// 采集抖音热榜数据 (抖音)
const getHotListData = async () => {
    return callApi('/get_hot_list_data');
};

// 批量下载收藏作品 (抖音)
const downloadFavoriteWorks = async (username) => {
    return callApi('/download_favorite_works', { username });
};

// 下载音频文件
const downloadAudio = async (musicUrl) => {
    try {
        const response = await axios({
            method: 'GET',
            url: musicUrl,
            responseType: 'arraybuffer'
        });

        const tempDir = path.join(__dirname, '..', '..', 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        const fileName = `audio_${Date.now()}.mp3`;
        const filePath = path.join(tempDir, fileName);

        await fs.writeFile(filePath, response.data);
        console.log(`音频文件已下载到: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('下载音频文件时出错:', error);
        throw error;
    }
};

module.exports = {
    downloadUserWorksTikTok,
    downloadUserWorksDouyin,
    downloadWorksByLinks,
    getLiveStreamUrl,
    getWorkComments,
    downloadMixWorks,
    getUserData,
    getSearchResults,
    getHotListData,
    downloadFavoriteWorks,
    getAudioUrl,
    downloadAudio
};