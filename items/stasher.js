module.exports = {
    name: 'soap stasher',
    async execute(message, args, BotClient, functions, user) {
        const bank = await functions.getBank(user.user_id); // 0 = current, 1 = max
        await functions.SQL("UPDATE users SET max_stash=? WHERE id=?", [bank[1] + 2500, user.id])
        message.reply("You used **Soap stasher** and expanded your stash capacity by **🧼2,500**!");
    }
}