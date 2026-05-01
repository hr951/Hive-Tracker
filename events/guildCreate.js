const { hr_log } = require("../utils/createLogs");

module.exports = {
    name: 'guildCreate',
    async execute(guild, client) {
        hr_log(`Server Join: ${guild.name} (Now: ${client.guilds.cache.size})`);
    },
};