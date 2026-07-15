const { ActivityType, PresenceUpdateStatus } = require("discord.js");
const { UserCache } = require('../db/db.js');
const path = require('path');
const fs = require('fs');

const LOCK_FILE = path.join(__dirname, '..', 'api_429_lock');

function isLocked(client) {
    if (fs.existsSync(LOCK_FILE)) {
        const stats = fs.statSync(LOCK_FILE);
        const elapsed = Date.now() - stats.mtimeMs;

        if (elapsed < client.COOLDOWN_TIME_MS) {
            const remaining = Math.ceil((client.COOLDOWN_TIME_MS - elapsed) / 1000);
            return remaining;
        } else {
            fs.unlinkSync(LOCK_FILE);
        }
    }
    return false;
}

module.exports = {
    name: 'clientReady',
    async execute(client) {
        setInterval(async () => {
            const trackingPlayers = await UserCache.countDocuments({});
            client.user.setPresence({
                activities: [
                    {
                        name: isLocked(client) ? `${isLocked(client)}秒後に追跡を再開します` : `${trackingPlayers}人のユーザーを追跡中`,
                        type: ActivityType.Playing
                    }
                ],
                status: isLocked(client) ? PresenceUpdateStatus.Idle : PresenceUpdateStatus.Online // Online : いつもの, DoNotDisturb : 赤い奴, Idle : 月のやつ, Invisible : 表示なし
            });
        }, 10_000);

        custom.log(`Logged in as ${client.user.tag}`);
    },
};