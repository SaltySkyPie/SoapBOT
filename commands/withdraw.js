module.exports = {
    name: 'withdraw',
    aliases: ['with', 'wth'],
    cooldown: 3,
    description: 'Basic withdraw command',
    async execute(message, args, BotClient, functions) {
        const user = message.member;
        const bank = await functions.getBank(user.id); // 0 = current, 1 = max
        const points = await functions.getPoints(user.id);
        if (!args.length) {
            return message.reply("You dumbo, you need to define how much you want to withdraw")
        }
        let dep = args[0].toLowerCase()
        if (dep == "max" || dep == "all") {
            dep = bank[0];
        } else {
            x = await functions.decodeNumber(dep)
            if (x) {
                dep = x;
            } else {
                return message.reply('I can only slip on numbers...');
            }
        }
        if (dep > bank[0]) {
            return message.reply('You don\'t even have that much soap...');
        }
        if (bank[0] == 0) {
            return message.reply("You have litteral zero in your stash. Imagine being so poor lmao");
        }

        await Promise.all([functions.setPoints(user.id, (points + dep)), functions.setBank(user.id, (bank[0] - dep))]);
        message.reply(`You withdrew 🧼**${dep.toLocaleString()}** from your stash. Your current stash balance is 🧼**${(bank[0] - dep).toLocaleString()}** and hand balance 🧼**${(points + dep).toLocaleString()}**.`);
    }
}