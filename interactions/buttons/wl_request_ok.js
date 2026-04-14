const { MessageFlags, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { basic_embed } = require("../../utils/embeds.js");

module.exports = {
    async execute(interaction) {
        try {
            const requestId = interaction.customId.replace('wl_request_ok__', '');
            const embed = basic_embed("使用申請が承認されました", `ただいまより、当ボットを使用いただけます`, "#2ecc71");
            const user = await interaction.client.users.fetch(requestId);
            await user.send({ embeds: [embed] });
            const disabledButton = ButtonBuilder.from(interaction.component).setDisabled(true);
            await interaction.update({ components: [new ActionRowBuilder().addComponents(disabledButton)] });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "DMの送信中にエラーが発生しました",
                flags: [MessageFlags.Ephemeral]
            });
        }
    }
};