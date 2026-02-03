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
