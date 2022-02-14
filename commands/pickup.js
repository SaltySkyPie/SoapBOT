const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'pickup',
    aliases: [],
    cooldown: 0,
    description: 'Basic pickup command',
    async execute(message, args, BotClient, functions) {

        const user = message.member;
        result = await functions.getSoapstatus(user.id)
        if (result == 2 || result == 3) {
            return message.reply("Don't worry. You are already bending over :)");
        }
        if (result === 0) {
            return message.reply("You seriously want your soap on the ground, don't you?");
        }
        //"SELECT link FROM gifs WHERE purpose=1 ORDER BY RAND() LIMIT 1",
        result = await functions.SQL("SELECT link FROM gifs WHERE purpose=1 ORDER BY RAND() LIMIT 1", [])
        let image = result[0].link;
        const DropEmbed = new MessageEmbed()
            .setTitle("Oh yeah!")
            .setDescription(`${user} is picking up their soap! Type "${global.prefix}daddy ${user}" to get some 🧼!\nYou have 10 seconds to do so!`)
            .setImage(image)
            .setColor("#ff00e4");


        await functions.setSoapstatus(user.id, 2)
        message.channel.send({ embeds: [DropEmbed] });
        const earned = Math.floor(Math.random() * (1500 - 750 + 1) + 750);
        setTimeout(async () => {
            points = await functions.getPoints(user.id)
            functions.setSoapstatus(user.id, 0);
            functions.setPoints(user.id, points + earned)
            message.channel.send(`**${user.displayName}** has picked up their soap and earned 🧼**${earned.toLocaleString()}**!`);
        }, 10000)
    }
}