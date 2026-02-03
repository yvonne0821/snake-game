# 🐍 贪吃蛇游戏

一个现代化的贪吃蛇游戏，使用原生JavaScript和Canvas实现。

## 功能特性

✅ 流畅的游戏体验
✅ 现代化渐变设计
✅ 响应式布局
✅ 本地最高分记录
✅ 速度递增挑战
✅ 暂停/继续功能
✅ 键盘控制

## 如何运行

### 方法1：使用本地服务器（推荐）

由于项目使用ES6模块，需要通过HTTP服务器运行。

**使用Python（推荐）：**
```bash
# Python 3
cd snake-game
python -m http.server 8000

# 然后在浏览器访问: http://localhost:8000
```

**使用Node.js：**
```bash
# 全局安装http-server
npm install -g http-server

# 运行服务器
cd snake-game
http-server -p 8000

# 然后在浏览器访问: http://localhost:8000
```

**使用VS Code Live Server插件：**
1. 安装 "Live Server" 插件
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

### 方法2：直接打开（可能需要浏览器设置）

某些浏览器可能阻止本地文件使用ES6模块，建议使用方法1。

## 游戏控制

- **方向键 (↑↓←→)**: 控制蛇的移动方向
- **空格键**: 暂停/继续游戏
- **Enter键**: 开始游戏或重新开始

## 游戏规则

1. 控制蛇吃掉红色的食物
2. 每吃一个食物，蛇身增长，得分+10
3. 每吃5个食物，游戏速度会提升
4. 撞墙或撞到自己会游戏结束
5. 最高分会自动保存在浏览器本地存储中

## 项目结构

```
snake-game/
├── index.html          # 主HTML文件
├── css/
│   └── style.css      # 样式文件
└── js/
    ├── main.js        # 入口文件
    ├── game.js        # 游戏主逻辑
    ├── snake.js       # 蛇类
    ├── config.js      # 配置常量
    └── utils.js       # 工具函数
```

## 技术栈

- 原生JavaScript (ES6+)
- Canvas 2D API
- CSS3 渐变和动画
- LocalStorage API

## 自定义配置

可以在 `js/config.js` 中修改游戏参数：
- Canvas大小
- 网格尺寸
- 初始速度
- 加速间隔
- 颜色方案

## 浏览器兼容性

支持所有现代浏览器：
- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 79+

## 开发说明

项目使用ES6模块系统，主要类：
- `Game`: 游戏控制器，管理游戏循环、渲染和状态
- `Snake`: 蛇的逻辑，处理移动、碰撞检测
- 工具函数处理食物生成、分数存储等

## 许可证

MIT License

## 作者

由 Claude Code 生成

---

祝你玩得开心！🎮
