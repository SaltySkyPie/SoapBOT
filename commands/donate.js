const { MessageEmbed } = require("discord.js")
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
    name: 'donate',
    aliases: [],
    slash: new SlashCommandBuilder()
    .setName('donate')
    .setDescription('Donate link to Soap BOT Developer!'),
    execute(message, args, BotClient, functions) {
        const e = new MessageEmbed()
        .setTitle("Donate to Soap BOT!")
        .setDescription("All the donations are going into Soap BOT development! Donations are optional and are always appreciated.\nhttps://buymeacoffee.com/SaltySkyPie")
        .setThumbnail(BotClient.user.avatarURL()).setColor("#ff00e4")

        message.reply({embeds: [e]})
    }
}