const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { HiveTracker, UserCache } = require('../db/db.js');

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
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const guildId = interaction.guildId;
        const name = interaction.options.getString('name');

        const guildConfig = await HiveTracker.findById(guildId);
        const players = guildConfig?.watchedPlayers || [];

        // 大小文字を区別せずに一致するプレイヤーを探す
        const targetName = players.find(p => p.toLowerCase() === name.toLowerCase());

        if (!targetName) {
            return interaction.editReply({
                content: `リストに **${name}** は見つかりませんでした。`
            });
        }

        // サーバーの配列から削除して保存
        guildConfig.watchedPlayers = players.filter(p => p !== targetName);
        await guildConfig.save();

        // 他のすべてのサーバーで、このプレイヤーがまだ監視リストに残っているかを確認
        const isStillWatchedSomewhere = await HiveTracker.exists({ watchedPlayers: targetName });

        // どこでも監視されていなければキャッシュを削除
        if (!isStillWatchedSomewhere) {
            await UserCache.findByIdAndDelete(targetName);
        }

        await custom.log(`User Remove: ${targetName}\nRemoved by ${interaction.member.displayName} / ${interaction.user.globalName} / ${interaction.user.tag}`);

        await interaction.editReply({
            content: `🗑️ **${targetName}** を監視リストから削除しました`
        });
    }
};