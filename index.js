const { Client, GatewayIntentBits, Partials, Collection, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require("dotenv").config();
require('./utils/createLogs.js');
const { HiveTracker, UserCache } = require('./db/db.js');
const { fields_embed } = require("./utils/embeds.js");
const { getGameName } = require("./utils/getGameName.js");

require('./server');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.User
    ]
});

const token = process.env.DISCORD_BOT_TOKEN;
const uri = process.env.DB;

const LOCK_FILE = path.join(__dirname, 'api_429_lock');
const COOLDOWN_TIME_MS = 20 * 60 * 1000;

mongoose.connect(uri)
    .then(() => custom.log('Connected DataBase - index.js'))
    .catch(err => custom.error('MongoDB Connection Error:', err));

client.commands = new Collection();

client.fetchAllStats = async (player) => {
    try {
        const res = await axios.get(`https://api.playhive.com/v0/game/all/all/${player}`);
        return res.data;
    } catch (error) {
        if (error.response?.status !== 404) {
            custom.error(`${player} のデータ取得失敗: ${error.message}`, error.response?.status);
            if (error.response?.status === 429) {
                fs.writeFileSync(LOCK_FILE, 'locked', 'utf8');
            }
        }
        return null;
    }
};

function isLocked() {
    if (fs.existsSync(LOCK_FILE)) {
        const stats = fs.statSync(LOCK_FILE);
        const elapsed = Date.now() - stats.mtimeMs;

        if (elapsed < COOLDOWN_TIME_MS) {
            const remaining = Math.ceil((COOLDOWN_TIME_MS - elapsed) / 1000);
            custom.log(`現在、429エラー制限による一時停止中です。残り ${remaining} 秒スキップします。`);
            return true;
        } else {
            custom.log("クールダウン期間が終了したため、ロックファイルを削除して通常処理に戻ります。");
            fs.unlinkSync(LOCK_FILE);
        }
    }
    return false;
}

// 2. 定期監視 (2分おき)
cron.schedule('*/2 * * * *', async () => {
    if (isLocked()) {
        return;
    }

    // 1. DBからすべての有効なサーバー設定と、すべてのキャッシュデータを一括取得
    const allGuilds = await HiveTracker.find({});
    const allCaches = await UserCache.find({});

    // 扱いやすいように Map化 または オブジェクト化
    const cacheMap = new Map(allCaches.map(c => [c._id, c.cache]));
    const latestDataBuffer = {};

    // 2. 重複のないプレイヤーリストを作成
    const allUniquePlayers = new Set();
    for (const guild of allGuilds) {
        // DBに存在する ＝ whiteListにある という扱いにすればOK
        guild.watchedPlayers.forEach(p => allUniquePlayers.add(p));
    }

    // 3. ユニークなプレイヤー全員分のデータを取得してバッファに
    for (const player of allUniquePlayers) {
        const data = await client.fetchAllStats(player);
        if (data) {
            latestDataBuffer[player] = data;
        }
    }

    // 4. 各サーバーごとに通知判定を行う
    for (const guild of allGuilds) {
        const channelId = guild.channelId_send;
        if (!channelId) continue;
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel) continue;

        for (const player of guild.watchedPlayers) {
            const data = latestDataBuffer[player];
            if (!data) continue;

            const games = ['sky', 'bed', 'ctf', 'hide', 'dr', 'murder', 'sg', 'drop', 'ground', 'build', 'party', 'bridge', 'grav'];

            games.forEach(gameKey => {
                const current = {
                    v: data[gameKey]?.victories || 0,
                    p: data[gameKey]?.played || 0
                };

                // cacheMap（DBから取ってきたデータ）から過去のデータを取得
                const playerCache = cacheMap.get(player);
                // Mongoose の Map からデータを取る時は .get() を使うか、プレーンなオブジェクトに変換しておく
                const prev = (playerCache instanceof Map ? playerCache.get(gameKey) : playerCache?.[gameKey]) || { v: 0, p: 0, s: 0 };
                const gameName = getGameName(gameKey);

                const diffV = current.v - prev.v;
                const diffP = current.p - prev.p;

                if (diffP > 0) {
                    let newStreak = prev.s || 0;
                    let newStreakMark = "";
                    const lossCount = diffP - diffV;

                    if (lossCount === 0) {
                        newStreak += diffV;
                        newStreakMark = "+";
                    } else {
                        newStreak = 0;
                    }

                    const fields = [
                        { name: "勝利数", value: `${prev.v} -> ${current.v} (+${diffV})` },
                        { name: "敗北数", value: `${prev.p - prev.v} -> ${current.p - current.v} (+${lossCount})` },
                        { name: "推定連勝数", value: `${prev.s} -> ${newStreak} (${newStreakMark}${newStreak - prev.s})` }
                    ];

                    const color = newStreak > 0 ? '#00FF00' : '#FF4500';
                    const img = new AttachmentBuilder()
                        .setName(`${gameKey}.png`)
                        .setFile(path.join(__dirname, 'images', `${gameKey}.png`));
                    try {
                        channel.send({ embeds: [fields_embed(`${player}: ${gameName}`, undefined, fields, `attachment://${gameKey}.png`, color)], files: [img] });
                    } catch (error) {
                        custom.error(`メッセージの送信に失敗しました\n${error}`, "");
                    }

                    if (!latestDataBuffer[player].streaks) latestDataBuffer[player].streaks = {};
                    latestDataBuffer[player].streaks[gameKey] = newStreak;
                }
            });
        }
    }

    // 5. 最後に一括で MongoDB のキャッシュを更新
    for (const player in latestDataBuffer) {
        const data = latestDataBuffer[player];
        const playerCache = cacheMap.get(player) || {};
        const updatedCache = {};

        ['sky', 'bed', 'ctf', 'hide', 'dr', 'murder', 'sg', 'drop', 'ground', 'build', 'party', 'bridge', 'grav'].forEach(gameKey => {
            const prevGame = (playerCache instanceof Map ? playerCache.get(gameKey) : playerCache?.[gameKey]) || {};
            const updatedStreak = data.streaks?.[gameKey] !== undefined
                ? data.streaks[gameKey]
                : (prevGame.s || 0);

            updatedCache[gameKey] = {
                v: data[gameKey]?.victories || 0,
                p: data[gameKey]?.played || 0,
                s: updatedStreak
            };
        });

        // upsert (存在しなければ作成、あれば更新) で保存
        await UserCache.updateOne(
            { _id: player },
            { $set: { cache: updatedCache } },
            { upsert: true }
        );
    }
});

// (以下、コマンド・イベント読み込みとログイン処理はそのまま)
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        custom.log(`${filePath} に必要な "data" か "execute" がありません。`);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.login(token);