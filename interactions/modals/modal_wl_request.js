const { MessageFlags } = require("discord.js");
const { basic_embed } = require("../../utils/embeds.js");

module.exports = {
    async execute(interaction) {
        const server_name = interaction.fields.getTextInputValue("server_name");

        try {
            const embed = basic_embed("使用申請を受信しました", `サーバー名: **${server_name}**\n申請者: **${interaction.user.tag}**`, "#3498db");

            const user = await interaction.client.users.fetch("962670040795201557");
            await user.send({ embeds: [embed] });
            await interaction.reply({
                content: "使用申請を送信しました",
                flags: [MessageFlags.Ephemeral]
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "使用申請送信中にエラーが発生しました",
                flags: [MessageFlags.Ephemeral]
            });
        }
    }
};