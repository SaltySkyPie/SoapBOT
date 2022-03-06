
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
    name: 'ping',
    aliases: [],
    slash: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('pong'),
    execute(message, args, BotClient, functions) {
        message.reply(`Pong 🏓 Latency is ${Date.now() - message.createdTimestamp}ms.`);
    }
}