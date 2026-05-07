const { MessageFlags, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { basic_embed } = require("../../utils/embeds.js");

module.exports = {
    async execute(interaction) {
        try {
            const requestId = interaction.customId.replace('wl_request_ng__', '');
            const embed = basic_embed("使用申請が却下されました", `申し訳ありませんが、使用申請は却下されました`, "#e74c3c");
            const user = await interaction.client.users.fetch(requestId);
            await user.send({ embeds: [embed] });
            const disabledButton = ButtonBuilder.from(interaction.component).setDisabled(true);
            await interaction.update({ components: [new ActionRowBuilder().addComponents(disabledButton)] });
        } catch (error) {
            custom.error(error.message, "");
            await interaction.reply({
                content: "DMの送信中にエラーが発生しました",
                flags: [MessageFlags.Ephemeral]
            });
        }
    }
};