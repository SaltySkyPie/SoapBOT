const fs = require("fs");

module.exports = (BotClient, functions) => {

    const load_dir = (dir) => {
        const event_files = fs.readdirSync(`./events/${dir}`).filter(file => file.endsWith('.js'));
        for (const file of event_files) {
            const event = require(`../events/${dir}/${file}`)
            const event_name = file.split('.')[0];
            BotClient.on(event_name, event.bind(null, BotClient, functions))
        }
    }

    
    ['client', 'guild'].forEach(e => load_dir(e));
}