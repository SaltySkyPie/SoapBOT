
module.exports = {
    name: 'buy',
    aliases: [],
    cooldown: 3,
    description: 'Basic buy command',
    async execute(message, args, BotClient, functions) {
        if (!args.length) {
            return message.reply("I mean don't get me wrong, but for this to work you need to specify an item name :)")
        }

        //console.log(args)
        let x = 1
        // logic
        if (args.length > 1) {
            const last = args.pop()
            const try_amount = await functions.decodeNumber(last)
            //console.log(try_amount)
            if(try_amount && typeof try_amount === 'number' && !isNaN(try_amount)) {
                x = try_amount
            } else {
                args.push(last)
            }
        }


        const buy_amount = x
        //console.log(args)
        const item_query = args.join(' ')
        //console.log(item_query)
        const [user, item, user_points] = await Promise.all([functions.getUserData(message.author.id), functions.getItemByName(item_query), functions.getPoints(message.author.id)])
        if (!item) {
            return message.reply("This item doesn't even exist lmao")
        }
        if (!item.stock || !item.buyable || !item.shop) {
            return message.reply("This item isn't even in the shop...")
        }
        if (user_points < item.buy_cost * buy_amount) {
            return message.reply("You don't have enough 🧼 to purchase this item :(");
        }
        // update stock
        if (item.stock && item.stock >= buy_amount && item.stock != -1) {
            functions.SQL(`UPDATE items SET stock=${item.stock - buy_amount} WHERE id=${item.id}`)
        }
        // update points
        functions.setPoints(user.user_id, (user_points - item.buy_cost * buy_amount))
        // update inventory
        const count = await functions.SQL(`SELECT count(id) as count FROM inventory WHERE user_id=${user.id} AND item_id=${item.id}`);
        if (count[0].count) {
            const amount = await functions.SQL(`SELECT amount FROM inventory WHERE user_id=${user.id} AND item_id=${item.id}`);
            await functions.SQL(`UPDATE inventory SET amount=${amount[0].amount + buy_amount} WHERE user_id=${user.id} AND item_id=${item.id}`)
        } else {
            await functions.SQL(`INSERT INTO inventory (user_id, item_id, amount) VALUES (${user.id}, ${item.id}, ?)`, [buy_amount])
        }
        message.reply(`You bought ${buy_amount}x **${item.item_name}**!`)
    }
}