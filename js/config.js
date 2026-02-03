// 游戏配置常量
export const CONFIG = {
    // Canvas 设置
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 600,

    // 网格设置
    GRID_SIZE: 20,  // 每个格子的大小（像素）

    // 游戏速度
    INITIAL_SPEED: 150,  // 初始速度（毫秒/格）
    SPEED_INCREMENT: 0.9,  // 速度增长系数（每次加速后速度 = 速度 * 系数）
    SPEED_UP_INTERVAL: 5,  // 每吃多少个食物加速一次
    MIN_SPEED: 50,  // 最快速度限制

    // 初始蛇的位置和长度
    INITIAL_SNAKE_LENGTH: 3,
    INITIAL_POSITION: { x: 10, y: 10 },

    // 方向常量
    DIRECTION: {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 }
    },

    // 颜色配置（现代渐变风格）
    COLORS: {
        BACKGROUND: '#1a1a2e',
        GRID: '#16213e',
        SNAKE_HEAD: '#4ecca3',
        SNAKE_BODY: '#3dbb8f',
        FOOD: '#ee4266',
        FOOD_GLOW: '#ff6b9d',
        TEXT: '#ffffff',
        TEXT_SECONDARY: '#eeeeee'
    },

    // 本地存储键名
    STORAGE_KEY: 'snakeGameHighScore'
};
