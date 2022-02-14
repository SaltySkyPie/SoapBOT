const { MessageEmbed } = require("discord.js")

module.exports = {
    name: 'community',
    aliases: ['server'],
    cooldown: 0,
    description: 'Basic community command',
    execute(message, args, BotClient, functions) {
        const e = new MessageEmbed()
        .setTitle("Join Soap BOT community server!")
        .setDescription("Daily giveaways, Beta testing and more!\nhttps://discord.gg/y3xMSTrUuD")
        .setThumbnail(BotClient.user.avatarURL())

        message.channel.send({embeds: [e]})
    }
}