const { SlashCommandBuilder } = require("discord.js");
require('dotenv').config();

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = "1488577463251636376";

// ----- グローバルコマンドここから-----
const add = new SlashCommandBuilder()
    .setName('add')
    .setDescription('ユーザーを監視リストに追加')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('ユーザー名')
            .setRequired(true)
    );

const remove = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('ユーザーを監視リストから削除')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('ユーザー名')
            .setRequired(true)
    );

const list = new SlashCommandBuilder()
    .setName('list')
    .setDescription('追跡中のユーザー一覧を表示');

const setup = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('通知を送るチャンネルを設定')
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('通知チャンネル')
            .setRequired(true)
    );

const commands = [add, remove, list, setup];

// 登録用関数
const { REST, Routes } = require("discord.js")
const rest = new REST({ version: '10' }).setToken(token)
async function main() {
    await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
    );
}

main().catch(err => console.log(err));