const fs = require("fs");

module.exports = (BotClient, functions) => {
    const command_files = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
    for (const file of command_files) {
        const command = require(`../commands/${file}`)
        if (command.name) {
            BotClient.commands.set(command.name, command)
        } else {
            continue;
        }
    }
}