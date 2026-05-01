const { hr_log } = require("../utils/createLogs");

module.exports = {
    name: 'guildDelete',
    async execute(guild, client) {
        hr_log(`Server Leave: ${guild.name} (Now: ${client.guilds.cache.size})`);
    },
};