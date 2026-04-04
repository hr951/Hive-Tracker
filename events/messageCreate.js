const { basic_embed } = require("../utils/embeds.js");

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        if (message.content.startsWith("!")) {
            if (message.content.startsWith("!invite") || message.content.startsWith("!add") || message.content.startsWith("!remove") || message.content.startsWith("!list")) {
                const embed = basic_embed("使用できるコマンドは以下の通りです", ' - `/add`...追跡するユーザーを追加します\n - `/remove`...追跡するユーザーを削除します\n - `/list`...追跡しているユーザーを表示します', '#3498db');
                message.reply({ embeds: [embed] });
            } else if (message.content === ("!hive") && message.author.id === "962670040795201557") {
                const guilds = client.guilds.cache;
                console.log("----------------------------------------");
                guilds.forEach(guild => {
                    console.log(`- ${guild.name} (ID: ${guild.id})`);
                });
                console.log("----------------------------------------");
            }
        }
    },
};