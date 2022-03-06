
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'use',
    aliases: [],
    slash: new SlashCommandBuilder()
        .setName('use')
        .setDescription('Use an item from your inventory')
        .addStringOption(option => option.setName('item').setDescription('Item name').setRequired(true)),
    async execute(message, args, BotClient, functions) {
        if (!args.length) {
            return message.reply("I mean don't get me wrong, but for this to work you need to specify an item name :)")
        }
        const item_query = args.join(' ')
        const [user, item] = await Promise.all([functions.getUserData(message.author.id), functions.getItemByName(item_query)])
        if (!item) {
            return message.reply("This item doesn't even exist lmao")
        }
        const item_ownership = await functions.SQL("SELECT * FROM inventory WHERE item_id=? AND user_id=? AND amount > ?", [item.id, user.id, 0])
        if (!item_ownership.length) {
            return message.reply("You don't own this item lol")
        }

        if (item.targetable) {
            message.reply("**Tag a target** :smirk:")
            const filter = m => m.author.id === message.author.id;
            await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                .then(async (collected) => {
                    const msg = collected.first();
                    if (!(msg.mentions.members.size > 0)) {
                        return message.reply("You need to tag someone...")
                    }
                    if (msg.mentions.members.first().id == message.author.id) {
                        return msg.reply("Really?")
                    }
                    const mention = await functions.getUserData(msg.mentions.members.first().id)
                    const checkActive = await functions.SQL("SELECT expiration_date FROM active_items WHERE user_id=? AND item_id=?", [mention.id, item.id])
                    if (checkActive.length) {
                        if ((new Date(checkActive[0].expiration_date)) - (new Date(Date.now())) > 0) {
                            return message.reply("This item is already active lol")
                        } else {
                            await functions.SQL("DELETE FROM active_items WHERE user_id=? AND item_id=?", [mention.id, item.id])
                        }
                    }
                    const date = functions.getUTCDate(item.active_duration * 1000);
                    functions.SQL("INSERT INTO active_items (user_id, item_id, expiration_date) VALUES (?,?,?)", [mention.id, item.id, date])



                    const collection_item = BotClient.items.get(item.item_name.toLowerCase())
                    if (collection_item) {
                        try {
                            collection_item.execute(msg, args, BotClient, functions, mention, item)
                            await functions.SQL("UPDATE inventory SET amount=? WHERE user_id=? AND item_id=?", [item_ownership[0].amount - 1, user.id, item.id])
                        } catch (e) {

                        }
                    } else {
                        return message.reply("This item isn't usable lmao")
                    }

                })
                .catch(async (collected) => {
                    message.reply("Time out....")
                });
        } else {
            if (item.activable) {
                const checkActive = await functions.SQL("SELECT expiration_date FROM active_items WHERE user_id=? AND item_id=?", [user.id, item.id])
                if (checkActive.length) {
                    if ((new Date(checkActive[0].expiration_date)) - (new Date(Date.now())) > 0) {
                        return message.reply("This item is already active lol")
                    } else {
                        await functions.SQL("DELETE FROM active_items WHERE user_id=? AND item_id=?", [user.id, item.id])
                    }
                }
                const date = functions.getUTCDate(item.active_duration * 1000)/*new Date(Date.now() + (item.active_duration * 1000));*/
                functions.SQL("INSERT INTO active_items (user_id, item_id, expiration_date) VALUES (?,?,?)", [user.id, item.id, date])
            }


            const collection_item = BotClient.items.get(item.item_name.toLowerCase())
            if (collection_item) {
                try {
                    collection_item.execute(message, args, BotClient, functions, user, item)
                    await functions.SQL("UPDATE inventory SET amount=? WHERE user_id=? AND item_id=?", [item_ownership[0].amount - 1, user.id, item.id])
                } catch (e) {

                }
            } else {
                return message.reply("This item isn't usable lmao")
            }
            return
        }
    }
}