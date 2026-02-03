// Firebase 配置和初始化
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, push, get, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyBfE6P64JbjNr8Q3OAeLsjTUu1JCBylH6g",
  authDomain: "snake-game-leaderboard-3ee02.firebaseapp.com",
  databaseURL: "https://snake-game-leaderboard-3ee02-default-rtdb.firebaseio.com",
  projectId: "snake-game-leaderboard-3ee02",
  storageBucket: "snake-game-leaderboard-3ee02.firebasestorage.app",
  messagingSenderId: "297382917481",
  appId: "1:297382917481:web:2ba58833da83f0881979f8"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * 获取全球排行榜前三名
 */
export async function getGlobalLeaderboard() {
    try {
        const leaderboardRef = ref(database, 'leaderboard');
        const leaderboardQuery = query(leaderboardRef, orderByChild('score'), limitToLast(3));

        const snapshot = await get(leaderboardQuery);

        if (snapshot.exists()) {
            const data = snapshot.val();
            // 转换为数组并按分数降序排序
            const leaderboard = Object.values(data).sort((a, b) => b.score - a.score);
            return leaderboard;
        }

        return [];
    } catch (error) {
        console.error('获取排行榜失败:', error);
        return [];
    }
}

/**
 * 保存分数到全球排行榜
 * @param {string} name - 玩家昵称
 * @param {number} score - 分数
 */
export async function saveToGlobalLeaderboard(name, score) {
    try {
        const leaderboardRef = ref(database, 'leaderboard');

        // 先获取当前排行榜
        const currentLeaderboard = await getGlobalLeaderboard();

        // 检查是否能进入前三名
        if (currentLeaderboard.length < 3 || score > currentLeaderboard[2].score) {
            // 生成新的记录
            const newEntryRef = push(leaderboardRef);
            await set(newEntryRef, {
                name: name || '匿名玩家',
                score: score,
                timestamp: Date.now(),
                date: new Date().toLocaleDateString('zh-CN')
            });

            // 清理多余的记录（只保留前10名，防止数据库过大）
            await cleanupLeaderboard();

            return true;
        }

        return false;
    } catch (error) {
        console.error('保存到排行榜失败:', error);
        return false;
    }
}

/**
 * 清理排行榜，只保留前10名
 */
async function cleanupLeaderboard() {
    try {
        const leaderboardRef = ref(database, 'leaderboard');
        const snapshot = await get(leaderboardRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            const entries = Object.entries(data).map(([key, value]) => ({ key, ...value }));

            // 按分数降序排序
            entries.sort((a, b) => b.score - a.score);

            // 删除第10名之后的记录
            if (entries.length > 10) {
                for (let i = 10; i < entries.length; i++) {
                    const entryRef = ref(database, `leaderboard/${entries[i].key}`);
                    await set(entryRef, null);  // 删除
                }
            }
        }
    } catch (error) {
        console.error('清理排行榜失败:', error);
    }
}

/**
 * 检查分数是否能进入前三名
 */
export async function isTopThreeGlobal(score) {
    const leaderboard = await getGlobalLeaderboard();

    // 如果排行榜不足3人，肯定能进
    if (leaderboard.length < 3) {
        return true;
    }

    // 检查是否超过第三名的分数
    return score > leaderboard[2].score;
}
