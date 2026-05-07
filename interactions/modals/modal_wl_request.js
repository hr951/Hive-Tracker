const { MessageFlags, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { basic_embed } = require("../../utils/embeds.js");
module.exports = {
    async execute(interaction) {
        const server_name = interaction.fields.getTextInputValue("server_name");

        try {
            const Button = new ButtonBuilder()
                .setCustomId(`wl_request_ok__${interaction.user.id}`)
                .setStyle(ButtonStyle.Success)
                .setEmoji("✅")
                .setLabel("承認");

            const Button2 = new ButtonBuilder()
                .setCustomId(`wl_request_ng__${interaction.user.id}`)
                .setStyle(ButtonStyle.Danger)
                .setEmoji("❌")
                .setLabel("却下");

            const embed = basic_embed("使用申請を受信しました", `サーバー名: **${server_name}**\n申請者: **${interaction.user.tag}**`, "#3498db");

            const user = await interaction.client.users.fetch("962670040795201557");
            await user.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(Button, Button2)] });
            await interaction.reply({
                content: "使用申請を送信しました",
                flags: [MessageFlags.Ephemeral]
            });
        } catch (error) {
            custom.error(error.message, "");
            await interaction.reply({
                content: "使用申請送信中にエラーが発生しました",
                flags: [MessageFlags.Ephemeral]
            });
        }
    }
};