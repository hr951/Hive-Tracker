module.exports = {
    name: 'guildCreate',
    async execute(guild, client) {
        custom.log(`Server Join: ${guild.name} (Now: ${client.guilds.cache.size})`);
    },
};