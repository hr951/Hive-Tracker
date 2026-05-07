const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('ユーザーを監視リストから削除')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('ユーザー名')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const guildId = interaction.guildId;
        const name = interaction.options.getString('name');

        const players = client.watchedPlayers[guildId];
        if (!players || !players.some(p => p.toLowerCase() === name.toLowerCase())) {
            return interaction.reply({
                content: `リストに **${name}** は見つかりませんでした。`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        const targetName = players.find(p => p.toLowerCase() === name.toLowerCase());

        client.watchedPlayers[guildId] = players.filter(p => p !== targetName);
        client.saveData(client.PLAYERS_FILE, client.watchedPlayers);

        const isStillWatchedSomewhere = Object.values(client.watchedPlayers).some(list =>
            list.includes(targetName)
        );

        if (!isStillWatchedSomewhere) {
            if (client.statsCache[targetName]) {
                delete client.statsCache[targetName];
                client.saveData(client.CACHE_FILE, client.statsCache);
            }
        }

        await custom.log(`User Remove: ${targetName}`);

        await interaction.reply({
            content: `🗑️ **${targetName}** を監視リストから削除しました`,
            flags: [MessageFlags.Ephemeral]
        });
    }
};