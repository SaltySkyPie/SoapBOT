const fs = require("fs");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = (BotClient, functions) => {
    const commands = []
    const command_files = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
    for (const file of command_files) {
        const command = require(`../commands/${file}`)
        if (command.name && command.slash) {
            commands.push(command.slash.toJSON())
        } else {
            continue;
        }
    }
    if (commands.length > 0) {
        const rest = new REST({ version: '10' }).setToken(BotClient.token);

        (async () => {
            try {
                console.log(`${functions.getTime()}[${global.shardId}][INFO] Started refreshing application (/) commands.`);

                await rest.put(
                    //Routes.applicationGuildCommands('908817514480406628', '910660654443135026'),
                    Routes.applicationCommands('908817514480406628'),
                    { body: commands },
                );

                console.log(`${functions.getTime()}[${global.shardId}][INFO] Successfully reloaded application (/) commands.`);
            } catch (error) {
                console.error(`${functions.getTime()}[${global.shardId}][ERROR] ${error}`);
            }
        })();
    }
}