const mongoose = require('mongoose');

const HiveSchema = new mongoose.Schema({
    _id: { type: String }, // GuildID (サーバーID)
    serverName: { type: String }, // whiteList.json にあったサーバー名
    channelId_send: { type: String }, // 送信対象チャンネルID (guild_configs)
    watchedPlayers: { type: [String], default: [] }, // 監視プレイヤー一覧 (players.json)
});

const UserCacheSchema = new mongoose.Schema({
    _id: { type: String }, // プレイヤー名
    cache: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} } // 各ゲームのオブジェクトを柔軟に保持
});

const HiveTracker = mongoose.model('HiveTracker', HiveSchema);
const UserCache = mongoose.model('UserCache', UserCacheSchema);

module.exports = { HiveTracker, UserCache };