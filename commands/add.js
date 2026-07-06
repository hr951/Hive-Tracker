const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { HiveTracker, UserCache } = require('../db/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('ユーザーを監視リストに追加')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('ユーザー名')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        
        const name = interaction.options.getString('name');
        const guildId = interaction.guildId;

        // 1. サーバーの設定ドキュメントを取得、なければ初期化
        let guildConfig = await HiveTracker.findById(guildId);
        if (!guildConfig) {
            guildConfig = new HiveTracker({
                _id: guildId,
                serverName: interaction.guild.name,
                watchedPlayers: []
            });
        }

        // 大小文字を区別せずに重複チェック
        const isDuplicate = guildConfig.watchedPlayers.some(p =>
            new RegExp(`^${name}$`, 'i').test(p)
        );

        if (isDuplicate) {
            return interaction.editReply({
                content: `❌ **${name}** は既にこのサーバーの監視リストに入っています。`
            });
        }

        // 2. Hive APIからデータ取得
        const data = await client.fetchAllStats(name);
        if (data) {
            const realName = data.main.username_cc || name;
            
            // サーバーの監視リストにプレイヤーを追加して保存
            guildConfig.watchedPlayers.push(realName);
            // もしサーバー名が更新されていたときのために一緒にセット
            guildConfig.serverName = interaction.guild.name; 
            await guildConfig.save();

            // 3. ユーザーキャッシュがなければ初期値を作成して保存
            const existingCache = await UserCache.findById(realName);
            if (!existingCache) {
                const initialCache = {
                    sky: { v: data.sky?.victories || 0, p: data.sky?.played || 0, s: 0 },
                    bed: { v: data.bed?.victories || 0, p: data.bed?.played || 0, s: 0 },
                    ctf: { v: data.ctf?.victories || 0, p: data.ctf?.played || 0, s: 0 },
                    hide: { v: data.hide?.victories || 0, p: data.hide?.played || 0, s: 0 },
                    dr: { v: data.dr?.victories || 0, p: data.dr?.played || 0, s: 0 },
                    murder: { v: data.murder?.victories || 0, p: data.murder?.played || 0, s: 0 },
                    sg: { v: data.sg?.victories || 0, p: data.sg?.played || 0, s: 0 },
                    drop: { v: data.drop?.victories || 0, p: data.drop?.played || 0, s: 0 },
                    ground: { v: data.ground?.victories || 0, p: data.ground?.played || 0, s: 0 },
                    build: { v: data.build?.victories || 0, p: data.build?.played || 0, s: 0 },
                    party: { v: data.party?.victories || 0, p: data.party?.played || 0, s: 0 },
                    bridge: { v: data.bridge?.victories || 0, p: data.bridge?.played || 0, s: 0 },
                    grav: { v: data.grav?.victories || 0, p: data.grav?.played || 0, s: 0 }
                };

                await UserCache.updateOne(
                    { _id: realName },
                    { $set: { cache: initialCache } },
                    { upsert: true }
                );
            }

            await interaction.editReply({
                content: `✅ **${realName}** を追加しました`
            });
            await custom.log(`User Add: ${realName}\nAdded by ${interaction.member.displayName} / ${interaction.user.globalName} / ${interaction.user.tag} / ${interaction.user.id}`);
        } else {
            await interaction.editReply({
                content: `❌ **${name}** というプレイヤーは見つかりませんでした。`
            });
        }
    }
};