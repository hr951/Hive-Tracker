const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { basic_embed } = require("../utils/embeds.js");
const { HiveTracker } = require('../db/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('追跡中のユーザー一覧を表示'),

    async execute(interaction, client) {
        const guildId = interaction.guildId;

        // DBからサーバー設定を取得
        const guildConfig = await HiveTracker.findById(guildId);
        const players = guildConfig?.watchedPlayers || [];

        const list = players.length > 0 
            ? players.map(p => `- ${p}`).join('\n') 
            : '追跡中のユーザーはいません。';

        const embed = basic_embed('📋 追跡中のユーザー一覧', list, '#3498db');
        await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
    }
};