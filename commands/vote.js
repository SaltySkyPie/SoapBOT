const { MessageEmbed } = require("discord.js")
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'vote',
    aliases: [],
    slash: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Vote for rewards!'),
    execute(message, args, BotClient, functions) {
        const e = new MessageEmbed()
            .setTitle("Upvote Soap BOT!")
            .setDescription("You can upvote Soap BOT to get some additional soap and items.\nhttps://discordbotlist.com/bots/soap-bot/upvote\nhttps://top.gg/bot/908817514480406628/vote")
            .setThumbnail(BotClient.user.avatarURL()).setColor("#ff00e4")
            .setURL('https://soapbot.net/vote')

        message.reply({ embeds: [e] })
    }
}