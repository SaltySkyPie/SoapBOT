const { MessageEmbed } = require("discord.js")

module.exports = {
    name: 'vote',
    aliases: [],
    cooldown: 0,
    description: 'Basic vote command',
    execute(message, args, BotClient, functions) {
        const e = new MessageEmbed()
            .setTitle("Upvote Soap BOT!")
            .setDescription("You can upvote Soap BOT to get some additional soap and items (TBD).\nhttps://discordbotlist.com/bots/soap-bot/upvote\nhttps://top.gg/bot/908817514480406628/vote")
            .setThumbnail(BotClient.user.avatarURL())

        message.channel.send({ embeds: [e] })
    }
}