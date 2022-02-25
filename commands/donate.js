const { MessageEmbed } = require("discord.js")

module.exports = {
    name: 'donate',
    aliases: [],
    cooldown: 0,
    description: 'Basic donate command',
    execute(message, args, BotClient, functions) {
        const e = new MessageEmbed()
        .setTitle("Donate to Soap BOT!")
        .setDescription("All the donations are going into Soap BOT development! Donations are optional and are always appreciated.\nhttps://buymeacoffee.com/SaltySkyPie")
        .setThumbnail(BotClient.user.avatarURL()).setColor("#ff00e4")

        message.channel.send({embeds: [e]})
    }
}