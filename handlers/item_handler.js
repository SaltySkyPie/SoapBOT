const fs = require("fs");

module.exports = (BotClient, functions) => {
    const item_files = fs.readdirSync('./items/').filter(file => file.endsWith('.js'));
    for (const file of item_files) {
        const item = require(`../items/${file}`)
        if (item.name) {
            BotClient.items.set(item.name, item)
        } else {
            continue;
        }
    }
}