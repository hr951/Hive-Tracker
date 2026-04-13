const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    async execute(interaction) {

        const modal = new ModalBuilder()
            .setTitle("申請するサーバー名を入力")
            .setCustomId("modal_wl_request");
        const TextInput_1 = new TextInputBuilder()
            .setLabel("サーバー名")
            .setCustomId("server_name")
            .setStyle("Short")
            .setPlaceholder("例) Hive身内鯖")
            .setMaxLength(4000)
            .setRequired(true);
        const ActionRow = new ActionRowBuilder().setComponents(TextInput_1);
        modal.setComponents(ActionRow);
        return interaction.showModal(modal);

    }
};