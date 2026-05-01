const { ActivityType, PresenceUpdateStatus } = require("discord.js");
const { hr_log } = require("../utils/createLogs");
require("dotenv").config();

module.exports = {
    name: 'clientReady',
    async execute(client) {
        setInterval(() => {
            const trackingPlayers = Object.keys(client.statsCache).length;
            client.user.setPresence({
                activities: [
                    {
                        name: `${trackingPlayers}人のユーザーを追跡中`,
                        type: ActivityType.Playing
                    }
                ],
                status: PresenceUpdateStatus.Online // Online : いつもの, DoNotDisturb : 赤い奴, Idle : 月のやつ, Invisible : 表示なし
            });
        }, 10_000);

        hr_log(`Logged in as ${client.user.tag}`);
    },
};