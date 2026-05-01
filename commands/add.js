const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { hr_log } = require('../utils/createLogs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('ユーザーを監視リストに追加')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('ユーザー名')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const name = interaction.options.getString('name');
        const guildId = interaction.guildId;

        if (!client.watchedPlayers[guildId]) client.watchedPlayers[guildId] = [];

        const isDuplicate = client.watchedPlayers[guildId].some(p =>
            new RegExp(`^${name}$`, 'i').test(p)
        );

        if (isDuplicate) {
            return interaction.reply({
                content: `❌ **${name}** は既にこのサーバーの監視リストに入っています。`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        const data = await client.fetchAllStats(name);
        if (data) {
            const realName = data.main.username_cc || name;
            client.watchedPlayers[guildId].push(realName);
            client.saveData(client.PLAYERS_FILE, client.watchedPlayers);

            if (!client.statsCache[realName]) {
                client.statsCache[realName] = {
                    sky: { v: data.sky?.victories || 0, p: data.sky?.played || 0 },
                    bed: { v: data.bed?.victories || 0, p: data.bed?.played || 0 },
                    ctf: { v: data.ctf?.victories || 0, p: data.ctf?.played || 0 },
                    hide: { v: data.hide?.victories || 0, p: data.hide?.played || 0 },
                    dr: { v: data.dr?.victories || 0, p: data.dr?.played || 0 },
                    murder: { v: data.murder?.victories || 0, p: data.murder?.played || 0 },
                    sg: { v: data.sg?.victories || 0, p: data.sg?.played || 0 },
                    drop: { v: data.drop?.victories || 0, p: data.drop?.played || 0 },
                    ground: { v: data.ground?.victories || 0, p: data.ground?.played || 0 },
                    build: { v: data.build?.victories || 0, p: data.build?.played || 0 },
                    party: { v: data.party?.victories || 0, p: data.party?.played || 0 },
                    bridge: { v: data.bridge?.victories || 0, p: data.bridge?.played || 0 },
                    grav: { v: data.grav?.victories || 0, p: data.grav?.played || 0 }
                };
                client.saveData(client.CACHE_FILE, client.statsCache);
            }
            await interaction.reply({
                content: `✅ **${realName}** を追加しました`,
                flags: [MessageFlags.Ephemeral]
            });
            await hr_log(`User Add: ${realName}`);
        } else {
            await interaction.reply({
                content: `❌ **${name}** というプレイヤーは見つかりませんでした。`,
                flags: [MessageFlags.Ephemeral]
            });
        }
    }
};