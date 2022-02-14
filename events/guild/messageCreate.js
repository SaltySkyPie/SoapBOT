const { default: Collection } = require("@discordjs/collection");

const cooldowns = new Map();

module.exports = async (BotClient, functions, message) => {
    try {
        const prefix = global.prefix;
        if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) { return; } else {
            if (!message.guild.me.permissionsIn(message.channel).has(['SEND_MESSAGES'])) {
                return console.error(functions.getTime() + `[${global.shardId}][ERROR] ${message.author.tag} tried to issue command but cannot reply: "Missing permissions".`);
            }

            ban = await functions.checkBan(message.author.id)

            if (ban) {
                return message.reply(`You were banned for **${ban}**! If you think you were banned unfairly you can appeal at https://soapbot.net`);
            }


            const addMent = async () => {
                if (message.mentions.members.size > 0) {
                    let i = 0;
                    message.mentions.members.forEach(el => {
                        functions.checkUserCreate(el.id).then(() => {
                            if (i >= (message.mentions.members.size - 1)) {
                                return;
                            }
                            i++;

                        })
                    });
                } else {
                    return;
                }

            }
            await Promise.all([
                addMent(),

                await functions.checkUserCreate(message.author.id),

                await functions.SQL("DELETE FROM active_items WHERE expiration_date<=?", [new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' ')])

            ])
            //await addMent()
            //await functions.checkUserCreate(message.author.id)
            //await functions.SQL("DELETE FROM active_items WHERE expiration_date<=?", [new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' ')])
            const user = await functions.getUserData(message.author.id)
            const args = message.content.slice(prefix.length).split(/ +/);
            const cmd = args.shift().toLowerCase();
            const command = BotClient.commands.get(cmd) || BotClient.commands.find(a => a.aliases && a.aliases.includes(cmd));
            if (command) {
                if (!(user.permissions > 100)) {
                    if (!cooldowns.has(command.name)) {
                        cooldowns.set(command.name, new Collection())
                    }


                    const current_time = Date.now();
                    const time_stamps = cooldowns.get(command.name);
                    const cooldown_amount = (command.cooldown) * 1000;

                    if (time_stamps.has(message.author.id)) {
                        const expiration_time = time_stamps.get(message.author.id) + cooldown_amount;

                        if (current_time < expiration_time) {
                            const time_left = (expiration_time - current_time) / 1000;

                            console.log(functions.getTime() + `[${global.shardId}][INFO] ${message.author.tag} tried to issue command ${cmd} but was on cooldown.`);
                            return message.reply(`Please wait ${time_left.toFixed(1)} seconds before using "${command.name}" again.`);
                        }
                    }

                    time_stamps.set(message.author.id, current_time)
                    setTimeout(() => {
                        time_stamps.delete(message.author.id, cooldown_amount);
                    }, cooldown_amount);
                }
                try {
                    command.execute(message, args, BotClient, functions);
                    console.log(functions.getTime() + `[${global.shardId}][INFO] ${message.author.tag} issued command ${cmd}. ` + `(${message})`);
                } catch (err) {
                    message.reply(`There was an error executing this command. (${err})`);
                    console.error(functions.getTime() + `[${global.shardId}][ERROR] ${message.author.tag} issued command ${cmd} and returned an error: "${err}".`)
                }
            }
        }
    } catch (err) {
        console.error(functions.getTime() + `[${global.shardId}][ERROR] ${message.author.tag} triggered messageCreate event and returned an error: "${err}".`);
    }
}