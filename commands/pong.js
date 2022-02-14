module.exports = {
    name: 'pong',
    aliases: [],
    cooldown: 0,
    description: 'Basic pong command',
    execute(message, args, BotClient, functions) {
        message.reply(`Ping 🏓 Latency is ${Date.now() - message.createdTimestamp}ms.`);
    }
}