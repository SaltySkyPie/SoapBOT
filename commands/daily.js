const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'daily',
    aliases: [],
    slash: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Daily reward'),
    async execute(message, args, BotClient, functions) {
        //return message.reply("Temporarily disabled");

        await functions.setPoints(message.author.id, (await functions.getPoints(message.author.id) + 10000))
        const DailyEmbed = new MessageEmbed()
            .setTitle(`Take your daily soapy reward!`)
            .setDescription(`You recieved 🧼**10,000**\nMake sure to check out https://soapbot.net and vote for Soap BOT for some additional goodies!`)
            .setColor("#ff00e4");

        message.reply({ embeds: [DailyEmbed] });

    }
}