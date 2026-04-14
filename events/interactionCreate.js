const { MessageFlags } = require("discord.js");
require("dotenv").config();

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            if (!client.whiteList[interaction.guildId]) {
                return interaction.reply({
                    content: '❌ このサーバーではこのボットを利用する権限がありません\n※当ボットはホワイトリスト制を採用しています\n　使用申請は当ボットのDMに`使用申請`と送信してください',
                    flags: [MessageFlags.Ephemeral]
                });
            }
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`${interaction.commandName} が見つかりません。`);
                return;
            }
            try {
                await command.execute(interaction, client);
            } catch (error) {
                try {
                    await interaction.reply({ content: 'Error', flags: [MessageFlags.Ephemeral] });
                    console.error(error);
                } catch (error) {
                    try {
                        await interaction.editReply({ content: 'Error', flags: [MessageFlags.Ephemeral] });
                        console.error(error);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        };

        if (interaction.isButton()) {
            try {
                const parts = interaction.customId.split('__');
                const fileName = parts[0];
                const button = require(`../interactions/buttons/${fileName}.js`);
                await button.execute(interaction, client);
            } catch (error) {
                console.error(`${interaction.customId} が見つかりません\n` + error);
                interaction.reply({ content: "Error", flags: [MessageFlags.Ephemeral] });
                return;
            }
        };

        if (interaction.isModalSubmit()) {
            try {
                const parts = interaction.customId.split('__');
                const fileName = parts[0];
                const modal = require(`../interactions/modals/${fileName}.js`);
                await modal.execute(interaction, client);
            } catch (error) {
                console.error(`${interaction.customId} が見つかりません\n` + error);
                interaction.reply({ content: "Error", flags: [MessageFlags.Ephemeral] });
                return;
            }
        };
    },
};