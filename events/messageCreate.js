const { MessageFlags, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { basic_embed } = require("../utils/embeds.js");

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        if (message.content.startsWith("!")) {
            if (message.content.startsWith("!invite") || message.content.startsWith("!add") || message.content.startsWith("!remove") || message.content.startsWith("!list")) {
                const embed = basic_embed("使用できるコマンドは以下の通りです", ' - `/setup`...通知を送信するチャンネルを設定します\n - `/add`...追跡するユーザーを追加します\n - `/remove`...追跡するユーザーを削除します\n - `/list`...追跡しているユーザーを表示します', '#3498db');
                message.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            } else if (message.content === ("!hive") && message.author.id === "962670040795201557") {
                const guilds = client.guilds.cache;
                console.log("----------------------------------------");
                guilds.forEach(guild => {
                    console.log(`- ${guild.name} (ID: ${guild.id})`);
                });
                console.log("----------------------------------------");
            }
        }

        if (message.content === "使用申請" && !message.guildId) {
            const Button = new ButtonBuilder()
                .setCustomId(`wl_request`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel("サーバー名を入力");

            message.reply({
                content: "使用申請を確認しました\n以下のボタンから使用したいサーバーの名前を記述してください\n※申請したからといって必ずしも承認されるわけではありません\n　ご了承ください",
                components: [new ActionRowBuilder().setComponents(Button)]
            });
        }
    },
};