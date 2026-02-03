// 游戏主类
import { CONFIG } from './config.js';
import { Snake } from './snake.js';
import {
    getRandomGridPosition,
    isPositionInArray,
    getHighScore,
    saveHighScore,
    isOppositeDirection
} from './utils.js';
import {
    getGlobalLeaderboard,
    saveToGlobalLeaderboard,
    isTopThreeGlobal
} from './firebase-config.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 设置Canvas大小
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        // 初始化游戏状态
        this.snake = new Snake();
        this.food = null;
        this.score = 0;
        this.highScore = getHighScore();
        this.speed = CONFIG.INITIAL_SPEED;
        this.gameState = 'ready';  // ready, playing, paused, gameOver
        this.gameLoopId = null;
        this.lastUpdateTime = 0;
        this.foodCount = 0;  // 记录吃掉的食物数量，用于加速
        this.leaderboard = [];  // 全球排行榜数据

        // 绑定键盘事件
        this.setupKeyboardControls();

        // 绑定触摸控制（手机支持）
        this.setupTouchControls();

        // 加载全球排行榜
        this.loadLeaderboard();

        // 生成第一个食物
        this.generateFood();

        // 渲染初始界面
        this.render();
    }

    /**
     * 设置键盘控制
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // 阻止方向键的默认行为（页面滚动）
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowUp':
                    if (!isOppositeDirection(CONFIG.DIRECTION.UP, this.snake.direction)) {
                        this.snake.setDirection(CONFIG.DIRECTION.UP);
                    }
                    break;
                case 'ArrowDown':
                    if (!isOppositeDirection(CONFIG.DIRECTION.DOWN, this.snake.direction)) {
                        this.snake.setDirection(CONFIG.DIRECTION.DOWN);
                    }
                    break;
                case 'ArrowLeft':
                    if (!isOppositeDirection(CONFIG.DIRECTION.LEFT, this.snake.direction)) {
                        this.snake.setDirection(CONFIG.DIRECTION.LEFT);
                    }
                    break;
                case 'ArrowRight':
                    if (!isOppositeDirection(CONFIG.DIRECTION.RIGHT, this.snake.direction)) {
                        this.snake.setDirection(CONFIG.DIRECTION.RIGHT);
                    }
                    break;
                case ' ':  // 空格键
                    this.togglePause();
                    break;
                case 'Enter':  // 回车键
                    if (this.gameState === 'ready' || this.gameState === 'gameOver') {
                        this.start();
                    }
                    break;
            }
        });
    }

    /**
     * 设置触摸控制（支持手机）
     */
    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        // 触摸开始
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: false });

        // 触摸结束
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;

            // 如果是点击（开始游戏）
            const deltaX = Math.abs(touchEndX - touchStartX);
            const deltaY = Math.abs(touchEndY - touchStartY);

            if (deltaX < 10 && deltaY < 10) {
                // 点击事件：开始游戏或暂停
                if (this.gameState === 'ready' || this.gameState === 'gameOver') {
                    this.start();
                } else if (this.gameState === 'playing') {
                    this.togglePause();
                } else if (this.gameState === 'paused') {
                    this.togglePause();
                }
                return;
            }

            // 计算滑动方向
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: false });
    }

    /**
     * 处理滑动手势
     */
    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 30; // 最小滑动距离

        // 判断是否达到最小滑动距离
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            return;
        }

        // 判断主要滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > 0) {
                // 向右滑动
                if (!isOppositeDirection(CONFIG.DIRECTION.RIGHT, this.snake.direction)) {
                    this.snake.setDirection(CONFIG.DIRECTION.RIGHT);
                }
            } else {
                // 向左滑动
                if (!isOppositeDirection(CONFIG.DIRECTION.LEFT, this.snake.direction)) {
                    this.snake.setDirection(CONFIG.DIRECTION.LEFT);
                }
            }
        } else {
            // 垂直滑动
            if (deltaY > 0) {
                // 向下滑动
                if (!isOppositeDirection(CONFIG.DIRECTION.DOWN, this.snake.direction)) {
                    this.snake.setDirection(CONFIG.DIRECTION.DOWN);
                }
            } else {
                // 向上滑动
                if (!isOppositeDirection(CONFIG.DIRECTION.UP, this.snake.direction)) {
                    this.snake.setDirection(CONFIG.DIRECTION.UP);
                }
            }
        }
    }

    /**
     * 生成食物
     */
    generateFood() {
        let newFood;
        // 确保食物不会生成在蛇身上
        do {
            newFood = getRandomGridPosition();
        } while (isPositionInArray(newFood, this.snake.body));

        this.food = newFood;
    }

    /**
     * 加载全球排行榜
     */
    async loadLeaderboard() {
        this.leaderboard = await getGlobalLeaderboard();
        this.render();  // 重新渲染以显示排行榜
    }

    /**
     * 开始游戏
     */
    start() {
        if (this.gameState === 'playing') return;

        // 如果是重新开始，重置所有状态
        if (this.gameState === 'gameOver' || this.gameState === 'ready') {
            this.snake.reset();
            this.score = 0;
            this.speed = CONFIG.INITIAL_SPEED;
            this.foodCount = 0;
            this.generateFood();
        }

        this.gameState = 'playing';
        this.startGameLoop();
    }

    /**
     * 暂停/继续
     */
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.stopGameLoop();
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.startGameLoop();
        }
    }

    /**
     * 启动游戏循环
     */
    startGameLoop() {
        this.stopGameLoop();  // 清除之前的循环
        this.lastUpdateTime = performance.now();

        const loop = (currentTime) => {
            // 计算时间差
            const deltaTime = currentTime - this.lastUpdateTime;

            // 只在达到速度间隔时更新游戏状态
            if (deltaTime >= this.speed) {
                this.update();
                this.lastUpdateTime = currentTime;
            }

            // 每帧都渲染，保持画面流畅
            this.render();

            // 继续循环
            if (this.gameState === 'playing') {
                this.gameLoopId = requestAnimationFrame(loop);
            }
        };

        this.gameLoopId = requestAnimationFrame(loop);
    }

    /**
     * 停止游戏循环
     */
    stopGameLoop() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
    }

    /**
     * 更新游戏状态
     */
    update() {
        if (this.gameState !== 'playing') return;

        // 检查是否吃到食物
        const ateFood = this.snake.isHeadAt(this.food);

        // 移动蛇
        this.snake.move(ateFood);

        // 如果吃到食物
        if (ateFood) {
            this.score += 10;
            this.foodCount++;
            this.generateFood();

            // 每吃5个食物加速一次
            if (this.foodCount % CONFIG.SPEED_UP_INTERVAL === 0) {
                this.speed = Math.max(
                    CONFIG.MIN_SPEED,
                    Math.floor(this.speed * CONFIG.SPEED_INCREMENT)
                );
            }
        }

        // 检查碰撞
        if (this.snake.checkWallCollision() || this.snake.checkSelfCollision()) {
            this.gameOver();
        }
    }

    /**
     * 游戏结束
     */
    async gameOver() {
        this.gameState = 'gameOver';
        this.stopGameLoop();

        // 更新最高分
        const isNewRecord = saveHighScore(this.score);
        if (isNewRecord) {
            this.highScore = this.score;
        }

        // 检查是否进入全球前三名
        const canEnterTopThree = await isTopThreeGlobal(this.score);

        if (canEnterTopThree) {
            // 延迟500ms后弹出输入框，让玩家先看到游戏结束画面
            setTimeout(async () => {
                const name = prompt('🎉 恭喜进入全球前三名！\n请输入你的昵称：', '');
                if (name !== null) {  // 用户点击了确定
                    await saveToGlobalLeaderboard(name.trim() || '匿名玩家', this.score);
                    // 重新加载排行榜并渲染
                    await this.loadLeaderboard();
                }
            }, 500);
        }

        this.render();
    }

    /**
     * 渲染游戏画面
     */
    render() {
        // 清空画布
        this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格（可选，让游戏更清晰）
        this.drawGrid();

        // 绘制食物
        this.drawFood();

        // 绘制蛇
        this.drawSnake();

        // 绘制UI信息
        this.drawUI();

        // 绘制游戏状态提示
        this.drawGameStateMessage();
    }

    /**
     * 绘制网格
     */
    drawGrid() {
        this.ctx.strokeStyle = CONFIG.COLORS.GRID;
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i <= this.canvas.width; i += CONFIG.GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }

        for (let i = 0; i <= this.canvas.height; i += CONFIG.GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }

    /**
     * 绘制食物
     */
    drawFood() {
        const x = this.food.x * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
        const y = this.food.y * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
        const radius = CONFIG.GRID_SIZE / 2.5;

        // 绘制光晕效果
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, CONFIG.COLORS.FOOD);
        gradient.addColorStop(0.5, CONFIG.COLORS.FOOD_GLOW);
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // 绘制食物主体
        this.ctx.fillStyle = CONFIG.COLORS.FOOD;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * 绘制圆角矩形（兼容旧浏览器）
     */
    drawRoundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    /**
     * 绘制蛇
     */
    drawSnake() {
        this.snake.body.forEach((segment, index) => {
            const x = segment.x * CONFIG.GRID_SIZE;
            const y = segment.y * CONFIG.GRID_SIZE;
            const size = CONFIG.GRID_SIZE;
            const radius = 5;  // 圆角半径

            // 头部使用不同颜色
            if (index === 0) {
                this.ctx.fillStyle = CONFIG.COLORS.SNAKE_HEAD;
            } else {
                // 身体使用渐变色
                this.ctx.fillStyle = CONFIG.COLORS.SNAKE_BODY;
            }

            // 绘制圆角矩形
            this.drawRoundRect(x + 1, y + 1, size - 2, size - 2, radius);
            this.ctx.fill();

            // 为头部添加眼睛
            if (index === 0) {
                this.ctx.fillStyle = '#ffffff';
                const eyeSize = 2;
                const eyeOffset = 5;

                // 根据方向调整眼睛位置
                if (this.snake.direction.x === 1) {  // 向右
                    this.ctx.fillRect(x + size - eyeOffset, y + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(x + size - eyeOffset, y + size - 7, eyeSize, eyeSize);
                } else if (this.snake.direction.x === -1) {  // 向左
                    this.ctx.fillRect(x + eyeOffset - 2, y + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(x + eyeOffset - 2, y + size - 7, eyeSize, eyeSize);
                } else if (this.snake.direction.y === 1) {  // 向下
                    this.ctx.fillRect(x + 5, y + size - eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + size - 7, y + size - eyeOffset, eyeSize, eyeSize);
                } else {  // 向上
                    this.ctx.fillRect(x + 5, y + eyeOffset - 2, eyeSize, eyeSize);
                    this.ctx.fillRect(x + size - 7, y + eyeOffset - 2, eyeSize, eyeSize);
                }
            }
        });
    }

    /**
     * 绘制UI信息
     */
    drawUI() {
        this.ctx.fillStyle = CONFIG.COLORS.TEXT;
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';

        // 绘制分数
        this.ctx.fillText(`分数: ${this.score}`, 10, 25);

        // 绘制最高分
        this.ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
        this.ctx.fillText(`最高分: ${this.highScore}`, 10, 50);

        // 绘制速度信息
        const speedPercent = Math.round((CONFIG.INITIAL_SPEED - this.speed) / (CONFIG.INITIAL_SPEED - CONFIG.MIN_SPEED) * 100);
        this.ctx.fillText(`速度: ${Math.max(0, speedPercent)}%`, 10, 75);

        // 绘制排行榜（右上角）
        this.drawLeaderboard();
    }

    /**
     * 绘制排行榜前三名
     */
    drawLeaderboard() {
        if (this.leaderboard.length === 0) return;

        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = CONFIG.COLORS.TEXT;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('🏆 全球排行榜', this.canvas.width - 10, 20);

        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;

        const medals = ['🥇', '🥈', '🥉'];
        this.leaderboard.forEach((entry, index) => {
            const y = 40 + index * 20;
            const medal = medals[index] || '';
            const text = `${medal} ${entry.name}: ${entry.score}`;
            this.ctx.fillText(text, this.canvas.width - 10, y);
        });
    }

    /**
     * 绘制游戏状态提示
     */
    drawGameStateMessage() {
        let message = '';
        let subMessage = '';

        switch (this.gameState) {
            case 'ready':
                message = '贪吃蛇';
                subMessage = '按 Enter 开始游戏';
                break;
            case 'paused':
                message = '游戏已暂停';
                subMessage = '按空格键继续';
                break;
            case 'gameOver':
                message = '游戏结束!';
                subMessage = `得分: ${this.score} | 按 Enter 重新开始`;
                break;
            default:
                return;  // 游戏进行中不显示提示
        }

        // 绘制半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制主消息
        this.ctx.fillStyle = CONFIG.COLORS.TEXT;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 - 20);

        // 绘制副消息
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
        this.ctx.fillText(subMessage, this.canvas.width / 2, this.canvas.height / 2 + 30);

        // 显示控制说明
        if (this.gameState === 'ready') {
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
            this.ctx.fillText('方向键控制 | 空格暂停', this.canvas.width / 2, this.canvas.height / 2 + 70);
        }
    }
}
