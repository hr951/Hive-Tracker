const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { basic_embed } = require("../utils/embeds.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('追跡中のユーザー一覧を表示'),

    async execute(interaction, client) {
        const guildId = interaction.guildId;
        const list = client.watchedPlayers[guildId] && client.watchedPlayers[guildId].length > 0 ? client.watchedPlayers[guildId].map(p => `- ${p}`).join('\n') : '追跡中のユーザーはいません。';
        const embed = basic_embed('📋 追跡中のユーザー一覧', list, '#3498db');
        await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
    }
};