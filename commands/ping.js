module.exports = {
    name: 'ping',
    aliases: [],
    cooldown: 0,
    description: 'Basic ping command',
    execute(message, args, BotClient, functions) {
        message.reply(`Pong 🏓 Latency is ${Date.now() - message.createdTimestamp}ms.`);
    }
}