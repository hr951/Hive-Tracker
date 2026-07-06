const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// モデルの読み込み（db.js のパスを合わせてください）
const { HiveTracker, UserCache } = require('./db/db.js');

// JSONファイルのパス設定
const PLAYERS_FILE = path.join(__dirname, 'data', 'players.json');
const CACHE_FILE = path.join(__dirname, 'data', 'cache.json');
const GUILD_CONFIG_FILE = path.join(__dirname, 'data', 'guild_configs.json');
const WHITELIST_FILE = path.join(__dirname, 'data', 'whiteList.json');

// 安全にJSONを読み込む関数
function loadJson(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`ファイルが見つかりません: ${filePath}`);
        return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function migrate() {
    try {
        // 1. MongoDBに接続 (環境変数の MONGODB_URI を使用)
        if (!process.env.DB) {
            throw new Error('.env ファイルに MONGODB_URI が設定されていません。');
        }
        await mongoose.connect(process.env.DB);
        console.log('MongoDB に接続しました。移行を開始します...');

        // 2. 各種JSONデータの読み込み
        const playersData = loadJson(PLAYERS_FILE);     // { guildId: [players] }
        const cacheData = loadJson(CACHE_FILE);         // { playerName: { game: { v, p, s } } }
        const configData = loadJson(GUILD_CONFIG_FILE); // { guildId: channelId }
        const whitelistData = loadJson(WHITELIST_FILE); // { guildId: serverName }

        // --- サーバー設定データ (HiveTracker) の移行 ---
        console.log('サーバー設定 (HiveTracker) の移行中...');
        
        // whitelistに載っているサーバー、または設定が存在するサーバーのIDをすべて抽出
        const allGuildIds = new Set([
            ...Object.keys(whitelistData),
            ...Object.keys(configData),
            ...Object.keys(playersData)
        ]);

        for (const guildId of allGuildIds) {
            // whitelistにある＝有効なサーバーとして扱う
            // もし設定だけ残っていてwhitelistにない場合も、データ欠損を防ぐために移行対象にします
            const serverName = whitelistData[guildId] || "未命名のサーバー（移行データ）";
            const channelId_send = configData[guildId] || null;
            const watchedPlayers = playersData[guildId] || [];

            await HiveTracker.updateOne(
                { _id: guildId },
                {
                    $set: {
                        serverName: serverName,
                        channelId_send: channelId_send,
                        watchedPlayers: watchedPlayers
                    }
                },
                { upsert: true }
            );
        }
        console.log(`サーバー設定の移行完了 (${allGuildIds.size} 件)`);

        // --- プレイヤーキャッシュ (UserCache) の移行 ---
        console.log('プレイヤーキャッシュ (UserCache) の移行中...');
        const playerNames = Object.keys(cacheData);

        for (const player of playerNames) {
            const playerCache = cacheData[player]; // { sky: {v, p, s}, bed: {...} }

            await UserCache.updateOne(
                { _id: player },
                {
                    $set: {
                        cache: playerCache
                    }
                },
                { upsert: true }
            );
        }
        console.log(`プレイヤーキャッシュの移行完了 (${playerNames.length} 件)`);

        console.log('すべてのデータ移行が正常に完了しました！');

    } catch (error) {
        console.error('移行中にエラーが発生しました:', error);
    } finally {
        // 接続を閉じる
        await mongoose.disconnect();
        console.log('MongoDB との接続を解除しました。');
    }
}

migrate();