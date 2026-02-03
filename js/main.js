// 入口文件
import { Game } from './game.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');

    if (!canvas) {
        console.error('Canvas元素未找到！');
        return;
    }

    // 创建游戏实例
    const game = new Game(canvas);

    console.log('贪吃蛇游戏已加载！按 Enter 开始游戏。');
});
