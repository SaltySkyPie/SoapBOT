const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'daily',
    aliases: [],
    cooldown: 86400,
    description: 'Basic daily command',
    async execute(message, args, BotClient, functions) {
        //return message.reply("Temporarily disabled");

        await functions.setPoints(message.author.id, (await functions.getPoints(message.author.id) + 2500))
        const DailyEmbed = new MessageEmbed()
            .setTitle(`Take your daily soapy reward!`)
            .setDescription(`You recieved 🧼**2,500**`)
            .setColor("#ff00e4");

        message.channel.send({ embeds: [DailyEmbed] });

    }
}