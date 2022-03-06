const { MessageEmbed } = require("discord.js")
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'community',
    aliases: ['server'],
    slash: new SlashCommandBuilder()
    .setName('community')
    .setDescription('Invite link to the Soap BOT community server'),
    execute(message, args, BotClient, functions) {
        const e = new MessageEmbed()
        .setTitle("Join Soap BOT community server!")
        .setDescription("Daily giveaways, Beta testing and more!\nhttps://discord.gg/y3xMSTrUuD")
        .setThumbnail(BotClient.user.avatarURL())
        .setColor("#ff00e4")

        message.reply({embeds: [e]})
    }
}