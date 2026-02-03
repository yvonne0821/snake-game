// 蛇类
import { CONFIG } from './config.js';
import { isSamePosition } from './utils.js';

export class Snake {
    constructor() {
        this.reset();
    }

    /**
     * 重置蛇到初始状态
     */
    reset() {
        // 初始化蛇身，头部在前
        this.body = [];
        for (let i = 0; i < CONFIG.INITIAL_SNAKE_LENGTH; i++) {
            this.body.push({
                x: CONFIG.INITIAL_POSITION.x - i,
                y: CONFIG.INITIAL_POSITION.y
            });
        }

        // 初始方向向右
        this.direction = { ...CONFIG.DIRECTION.RIGHT };
        this.nextDirection = { ...CONFIG.DIRECTION.RIGHT };
    }

    /**
     * 获取蛇头位置
     */
    getHead() {
        return this.body[0];
    }

    /**
     * 设置移动方向
     */
    setDirection(newDirection) {
        this.nextDirection = newDirection;
    }

    /**
     * 移动蛇
     * @param {boolean} grow - 是否生长（吃到食物时为true）
     */
    move(grow = false) {
        // 更新实际方向（在移动时才更新，避免快速按键导致的反向移动）
        this.direction = this.nextDirection;

        // 计算新的头部位置
        const head = this.getHead();
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };

        // 将新头部添加到蛇身前端
        this.body.unshift(newHead);

        // 如果不是生长状态，移除尾部
        if (!grow) {
            this.body.pop();
        }
    }

    /**
     * 检查蛇头是否撞墙
     */
    checkWallCollision() {
        const head = this.getHead();
        const cols = CONFIG.CANVAS_WIDTH / CONFIG.GRID_SIZE;
        const rows = CONFIG.CANVAS_HEIGHT / CONFIG.GRID_SIZE;

        return head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
    }

    /**
     * 检查蛇头是否撞到自己
     */
    checkSelfCollision() {
        const head = this.getHead();
        // 从第二节开始检查（跳过头部）
        for (let i = 1; i < this.body.length; i++) {
            if (isSamePosition(head, this.body[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查蛇头是否在指定位置
     */
    isHeadAt(position) {
        return isSamePosition(this.getHead(), position);
    }

    /**
     * 获取蛇的长度
     */
    getLength() {
        return this.body.length;
    }
}
