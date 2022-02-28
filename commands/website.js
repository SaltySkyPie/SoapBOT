const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'website',
    aliases: ['web', 'page'],
    cooldown: 0,
    description: 'Basic web command',
    execute(message, args, BotClient, functions) {
        const DailyEmbed = new MessageEmbed()
            .setTitle(`Soap BOT!`)
            .setDescription(`Check out Soap BOT website!\nhttps://soapbot.net`)
            .setColor("#ff00e4")
            .setURL('https://soapbot.net').setThumbnail(BotClient.user.avatarURL());

        message.channel.send({ embeds: [DailyEmbed] });
    }
}