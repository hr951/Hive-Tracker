const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('プレイヤーを監視リストに追加')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('プレイヤー名')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const name = interaction.options.getString('name');
        if (client.watchedPlayers.includes(name)) return interaction.reply({ content: '既に追加されています', flags: [MessageFlags.Ephemeral] });

        client.watchedPlayers.push(name);
        client.saveData(client.PLAYERS_FILE, client.watchedPlayers);

        const data = await client.fetchAllStats(name);
        if (data) {
            client.statsCache[name] = {
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
            await interaction.reply({ content: `✅ **${name}** を追加しました`, flags: [MessageFlags.Ephemeral] });
        } else {
            const index = client.watchedPlayers.indexOf(name);
            client.watchedPlayers.splice(index, 1);
            delete client.statsCache[name];

            client.saveData(client.PLAYERS_FILE, client.watchedPlayers);
            client.saveData(client.CACHE_FILE, client.statsCache);
            await interaction.reply({ content: `❌ **${name}** のデータを取得できませんでした`, flags: [MessageFlags.Ephemeral] });
        }
    }
};