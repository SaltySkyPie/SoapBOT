
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
    name: 'pong',
    aliases: [],
    slash: new SlashCommandBuilder()
        .setName('pong')
        .setDescription('ping'),
    execute(message, args, BotClient, functions) {
        message.reply(`Ping 🏓 Latency is ${Date.now() - message.createdTimestamp}ms.`);
    }
}