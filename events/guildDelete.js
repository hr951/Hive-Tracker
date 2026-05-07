module.exports = {
    name: 'guildDelete',
    async execute(guild, client) {
        custom.log(`Server Leave: ${guild.name} (Now: ${client.guilds.cache.size})`);
    },
};