module.exports = {
    name: 'valentine shit 2022',
    async execute(message, args, BotClient, functions, user) {
        const item = await functions.getItemByName('valentine shit 2022 (gifted)')
        const count = await functions.SQL(`SELECT count(id) as count FROM inventory WHERE user_id=${user.id} AND item_id=${item.id}`);
        if (count[0].count) {
            const amount = await functions.SQL(`SELECT amount FROM inventory WHERE user_id=${user.id} AND item_id=${item.id}`);
            await functions.SQL(`UPDATE inventory SET amount=${amount[0].amount + 1} WHERE user_id=${user.id} AND item_id=${item.id}`)
        } else {
            await functions.SQL(`INSERT INTO inventory (user_id, item_id, amount) VALUES (${user.id}, ${item.id}, ?)`, [1])
        }
        message.reply("You showed your true hate and used **Valentine Shit 2022**!");
    }
}