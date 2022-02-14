module.exports = {
    name: 'deposit',
    aliases: ['dep'],
    cooldown: 3,
    description: 'Basic deposit command',
    async execute(message, args, BotClient, functions) {
        const user = message.member;
        const bank = await functions.getBank(user.id); // 0 = current, 1 = max
        const points = await functions.getPoints(user.id);
        if (!args.length) {
            return message.reply("You dumbo, you need to define how much you want to deposit")
        }
        let dep = args[0].toLowerCase()
        if (dep == "max" || dep == "all") {
            dep = points;
        } else {
            x = await functions.decodeNumber(dep)
            if (x) {
                dep = x;
            } else {
                return message.reply('I can only slip on numbers...');
            }
        }
        if (dep > points) {
            return message.reply('You don\'t even have that much soap...');
        }
        if (points == 0) {
            return message.reply("You have litteral zero in your hand. Imagine being so poor lmao");
        }
        if (bank[0] == bank[1]) {
            return message.reply("Your stash is overflowing with foam...")
        }
        if ((bank[1] - bank[0]) < dep) {
            dep = bank[1] - bank[0];
        }

        await Promise.all([functions.setPoints(user.id, (points - dep)), functions.setBank(user.id, (bank[0] + dep))]);
        message.reply(`You deposited 🧼**${dep.toLocaleString()}** to your stash. Your current stash balance is 🧼**${(bank[0] + dep).toLocaleString()}** and hand balance 🧼**${(points - dep).toLocaleString()}**.`);
    }
}