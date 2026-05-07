const { Client, GatewayIntentBits, Partials, Collection, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
require("dotenv").config();
require('./utils/createLogs.js');

const { fields_embed } = require("./utils/embeds.js");
const { getGameName } = require("./utils/getGameName.js");

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

// 設定
const token = process.env.DISCORD_BOT_TOKEN;

const PLAYERS_FILE = path.join(__dirname, 'data', 'players.json');
const CACHE_FILE = path.join(__dirname, 'data', 'cache.json');
const GUILD_CONFIG_FILE = path.join(__dirname, 'data', 'guild_configs.json');
const WHITELIST_FILE = path.join(__dirname, 'data', 'whiteList.json');

// --- データ管理関数 ---
function loadData(filePath, defaultValue = []) {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(defaultValue));
        return defaultValue;
    }
    return JSON.parse(fs.readFileSync(filePath));
}

client.commands = new Collection();
client.watchedPlayers = loadData(PLAYERS_FILE, {});
client.statsCache = loadData(CACHE_FILE, {});
client.guildConfigs = loadData(GUILD_CONFIG_FILE, {});
client.whiteList = loadData(WHITELIST_FILE, {});
client.PLAYERS_FILE = PLAYERS_FILE;
client.CACHE_FILE = CACHE_FILE;
client.GUILD_CONFIG_FILE = GUILD_CONFIG_FILE;
client.WHITELIST_FILE = WHITELIST_FILE;

client.saveData = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
client.fetchAllStats = async (player) => {
    try {
        const res = await axios.get(`https://api.playhive.com/v0/game/all/all/${player}`);
        return res.data;
    } catch (error) {
        if (error.response?.status !== 404) {
            custom.error(`${player} のデータ取得失敗: ${error.message}`, error.response?.status);
        }
        return null;
    }
};

// 2. 定期監視 (2分おき)
cron.schedule('*/2 * * * *', async () => {
    // 今回のループで取得した最新データを一時的に保存する場所
    const latestDataBuffer = {};

    // 1. まず、全サーバーで監視されている「重複のないプレイヤーリスト」を作成
    const allUniquePlayers = new Set();
    for (const guildId in client.watchedPlayers) {
        if (!client.whiteList[guildId]) continue;
        client.watchedPlayers[guildId].forEach(p => allUniquePlayers.add(p));
    }

    // 2. ユニークなプレイヤー全員分のデータを先に取得してバッファに入れる
    for (const player of allUniquePlayers) {
        const data = await client.fetchAllStats(player);
        if (data) {
            latestDataBuffer[player] = data;
        }
    }

    // 3. 各サーバーごとに通知判定を行う（ここではキャッシュを書き換えない）
    for (const guildId in client.watchedPlayers) {
        if (!client.whiteList[guildId]) continue;

        const channelId = client.guildConfigs[guildId];
        if (!channelId) continue;
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel) continue;

        for (const player of client.watchedPlayers[guildId]) {
            const data = latestDataBuffer[player];
            if (!data) continue;

            const games = ['sky', 'bed', 'ctf', 'hide', 'dr', 'murder', 'sg', 'drop', 'ground', 'build', 'party', 'bridge', 'grav'];

            games.forEach(gameKey => {
                const current = {
                    v: data[gameKey]?.victories || 0,
                    p: data[gameKey]?.played || 0
                };
                const prev = client.statsCache[player]?.[gameKey] || { v: 0, p: 0, s: 0 };
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
                        .setFile(`./images/${gameKey}.png`);
                    try {
                        channel.send({ embeds: [fields_embed(`${player}: ${gameName}`, undefined, fields, `attachment://${gameKey}.png`, color)], files: [img] });
                    } catch (error) {
                        custom.error(`メッセージの送信に失敗しました\n${error}`, "");
                    }

                    // 一時的なバッファに連勝数を保存（後で一括更新するため）
                    if (!latestDataBuffer[player].streaks) latestDataBuffer[player].streaks = {};
                    latestDataBuffer[player].streaks[gameKey] = newStreak;
                }
            });
        }
    }

    // 4. 最後に一括でキャッシュを更新
    for (const player in latestDataBuffer) {
        const data = latestDataBuffer[player];
        if (!client.statsCache[player]) client.statsCache[player] = {};

        ['sky', 'bed', 'ctf', 'hide', 'dr', 'murder', 'sg', 'drop', 'ground', 'build', 'party', 'bridge', 'grav'].forEach(gameKey => {
            const updatedStreak = data.streaks?.[gameKey] !== undefined
                ? data.streaks[gameKey]
                : (client.statsCache[player][gameKey]?.s || 0);

            client.statsCache[player][gameKey] = {
                v: data[gameKey]?.victories || 0,
                p: data[gameKey]?.played || 0,
                s: updatedStreak
            };
        });
    }
    client.saveData(client.CACHE_FILE, client.statsCache);
});

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