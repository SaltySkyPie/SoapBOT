const { MessageEmbed, MessageAttachment } = require("discord.js");

module.exports = {
    name: 'balance',
    aliases: ['bal', 'balan'],
    cooldown: 3,
    description: 'Basic balance command',
    async execute(message, args, BotClient, functions) {

        const user = message.member;
        let mention = message.mentions.members.first();

        if (!mention) {
            mention = user;
        }
        if (message.mentions.members.size > 1 || args.length > 1) {
            return message.reply("You can only mention one person donkey.");
        }
        points = await Promise.all([functions.getPoints(mention.id), functions.getBank(mention.id)])
        const BalanceEmbed = new MessageEmbed()
            .setTitle(`${mention.displayName}'s balance`)
            .setDescription(`Hand: 🧼**${points[0].toLocaleString()}**\nStash: 🧼**${points[1][0].toLocaleString()}** / 🧼**${points[1][1].toLocaleString()}**`)
            .setColor("#ff00e4");


        message.channel.send({ embeds: [BalanceEmbed] });



    }
}