module.exports = {
    name: 'daddy',
    aliases: [],
    cooldown: 5,
    description: 'Basic daddy command',
    async execute(message, args, BotClient, functions) {

        const user = message.member;
        const mention = message.mentions.members.first();

        if (!mention) {
            return message.reply("Daddy? Try again with an actual person.");
        }
        if (message.mentions.members.size > 1 || args.length > 1) {
            return message.reply("You can only mention one person donkey.");
        }

        result = await functions.getSoapstatus(mention.id)
        if (result == 3) {
            return message.reply(`**${mention.displayName}** was already **DADDY**'d lmao. You are too slow :(`);
        }
        if (result != 2) {
            return message.reply(`**${mention.displayName}** isn't even picking their soap up... Open your eyes pls.`);
        }
        await functions.setSoapstatus(mention.id, 3)
        const earned = Math.floor(Math.random() * (1500 - 750 + 1) + 750);
        points = await functions.getPoints(user.id)
        await functions.setPoints(user.id, points + earned)
        message.reply(`You used the **DADDY** spell and obtained 🧼**${earned.toLocaleString()}**!`);

    }
}