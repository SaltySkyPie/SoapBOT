const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'website',
    aliases: ['web', 'page'],
    slash: new SlashCommandBuilder()
    .setName('website')
    .setDescription('Soap BOT website'),
    execute(message, args, BotClient, functions) {
        const DailyEmbed = new MessageEmbed()
            .setTitle(`Soap BOT!`)
            .setDescription(`Check out Soap BOT website!\nhttps://soapbot.net`)
            .setColor("#ff00e4")
            .setURL('https://soapbot.net').setThumbnail(BotClient.user.avatarURL());

        message.reply({ embeds: [DailyEmbed] });
    }
}