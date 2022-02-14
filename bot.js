async function start() {
    process.on('unhandledRejection', error => {
        console.error('Unhandled promise rejection:', error);
    });
    const functions = require('./functions');
    require('dotenv').config();
    global.prefix = process.env.PREFIX;
    const token = process.env.TOKEN;
    const { Client, Intents, Collection } = require("discord.js");
    const BotClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    BotClient.commands = new Collection();
    BotClient.events = new Collection();
    BotClient.items = new Collection();

    ['command_handler', 'event_handler', 'item_handler'].forEach(handler => {
        require(`./handlers/${handler}`)(BotClient, functions);
    })


    BotClient.login(token);

}

start();