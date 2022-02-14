const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'drop',
    aliases: [],
    cooldown: 90,
    description: 'Basic drop command',
    async execute(message, args, BotClient, functions) {

        const user = message.member;
        const mention = message.mentions.members.first();

        if (!mention) {
            return message.reply("Soap on a rope saves the day. Try again with an actual person.");
        }
        if (message.mentions.members.size > 1 || args.length > 1) {
            return message.reply("You can only mention one person donkey.");
        }

        if (user.id == mention.id) {
            return message.reply("Get lost!");
        }
        bruh = await functions.getSoapstatus(user.id)
        if (bruh != 0) {
            return message.reply("You need to pick up your soap first...");
        }
        result = await functions.getSoapstatus(mention.id)
        if (result != 0) {
            return message.reply("Do you not see their soap on the ground already?");
        }
        const dbUser = await functions.getUserData(mention.id)
        const checkRope = await functions.SQL("SELECT id FROM active_items WHERE user_id=? AND item_id=1", [dbUser.id])
        if (checkRope.length) {
            await functions.SQL("DELETE FROM active_items WHERE item_id=1 AND user_id=?", [dbUser.id])
            return message.reply(`You tried to drop **${mention.displayName}**'s soap, but didn't realize they had very thicc rope on it. You failed lmao.`)
        }

        result = await functions.SQL("SELECT link FROM gifs WHERE purpose=0 ORDER BY RAND() LIMIT 1", [])

        let image = result[0].link;
        const DropEmbed = new MessageEmbed()
            .setTitle("Oh no!")
            .setDescription(`**${mention.displayName}** dropped the soap! Type "${global.prefix}pickup" to pick up the soap!\nYou have 5 minutes to pick up your soap!`)
            .setImage(image)
            .setColor("#ff00e4");


        await functions.setSoapstatus(mention.id, 1)
        message.channel.send({ embeds: [DropEmbed] });
        setTimeout(async () => {
            result = await functions.getSoapstatus(mention.id)
            if (result == 1) {
                message.channel.send(`**${mention.displayName}** didn't pick up their soap in time. They lost 🧼**250**. :(`);
                functions.setSoapstatus(mention.id, 0);
                result = await functions.getPoints(mention.id)
                if (result >= 100) {
                    functions.setPoints(mention.id, result - 250);
                } else {
                    functions.setPoints(mention.id, 0);
                }
            } else if (result == 3) {
                functions.setSoapstatus(mention.id, 0);
            }
        }, 300000);
    }
}