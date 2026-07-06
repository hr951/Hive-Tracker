const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { HiveTracker } = require('../db/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('通知を送るチャンネルを設定')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('通知チャンネル')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const guildId = interaction.guildId;
        const channel = interaction.options.getChannel('channel');

        // サーバーIDをキーにして、送信先チャンネルIDを設定。サーバー名も一緒に更新
        await HiveTracker.updateOne(
            { _id: guildId },
            { 
                $set: { 
                    channelId_send: channel.id,
                    serverName: interaction.guild.name
                } 
            },
            { upsert: true }
        );

        await interaction.reply({ content: `✅ このサーバーの通知先を ${channel} に設定しました。`, flags: [MessageFlags.Ephemeral] });
    }
};