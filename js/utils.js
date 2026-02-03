// 工具函数
import { CONFIG } from './config.js';

/**
 * 生成随机网格坐标
 */
export function getRandomGridPosition() {
    const cols = CONFIG.CANVAS_WIDTH / CONFIG.GRID_SIZE;
    const rows = CONFIG.CANVAS_HEIGHT / CONFIG.GRID_SIZE;

    return {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows)
    };
}

/**
 * 检查两个位置是否相同
 */
export function isSamePosition(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * 检查位置是否在数组中
 */
export function isPositionInArray(position, array) {
    return array.some(item => isSamePosition(item, position));
}

/**
 * 获取本地存储的最高分
 */
export function getHighScore() {
    try {
        const score = localStorage.getItem(CONFIG.STORAGE_KEY);
        return score ? parseInt(score, 10) : 0;
    } catch (e) {
        console.warn('localStorage不可用，无法读取最高分:', e);
        return 0;
    }
}

/**
 * 保存最高分到本地存储
 */
export function saveHighScore(score) {
    try {
        const currentHighScore = getHighScore();
        if (score > currentHighScore) {
            localStorage.setItem(CONFIG.STORAGE_KEY, score.toString());
            return true;  // 返回是否创造了新纪录
        }
        return false;
    } catch (e) {
        console.warn('localStorage不可用，无法保存最高分:', e);
        return false;
    }
}

/**
 * 检查方向是否相反
 */
export function isOppositeDirection(dir1, dir2) {
    return dir1.x === -dir2.x && dir1.y === -dir2.y;
}

/**
 * 获取排行榜前三名
 */
export function getLeaderboard() {
    try {
        const data = localStorage.getItem(CONFIG.LEADERBOARD_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.warn('localStorage不可用，无法读取排行榜:', e);
        return [];
    }
}

/**
 * 保存分数到排行榜
 * @param {string} name - 玩家昵称
 * @param {number} score - 分数
 * @returns {boolean} - 是否进入前三名
 */
export function saveToLeaderboard(name, score) {
    try {
        let leaderboard = getLeaderboard();

        // 添加新分数
        leaderboard.push({
            name: name || '匿名玩家',
            score: score,
            date: new Date().toLocaleDateString('zh-CN')
        });

        // 按分数降序排序
        leaderboard.sort((a, b) => b.score - a.score);

        // 只保留前三名
        leaderboard = leaderboard.slice(0, 3);

        // 保存
        localStorage.setItem(CONFIG.LEADERBOARD_KEY, JSON.stringify(leaderboard));

        // 检查是否进入前三名
        return leaderboard.some(entry => entry.name === name && entry.score === score);
    } catch (e) {
        console.warn('localStorage不可用，无法保存排行榜:', e);
        return false;
    }
}

/**
 * 检查分数是否能进入前三名
 * @param {number} score - 分数
 * @returns {boolean}
 */
export function isTopThree(score) {
    const leaderboard = getLeaderboard();

    // 如果排行榜不足3人，肯定能进
    if (leaderboard.length < 3) {
        return true;
    }

    // 检查是否超过第三名的分数
    return score > leaderboard[2].score;
}
