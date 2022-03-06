const { default: Collection } = require("@discordjs/collection");


module.exports = async (BotClient, functions, message) => {
    try {
        console.log(`${functions.getTime()}[${global.shardId}][CHAT] (${message.guild.name}) ${message.author.tag}: ${message}`)
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

                await functions.SQL("DELETE FROM active_items WHERE expiration_date<=?", [functions.getUTCDate()])

            ])
            const user = await functions.getUserData(message.author.id)
            const args = message.content.slice(prefix.length).split(/ +/);
            const cmd = args.shift().toLowerCase();
            const command = BotClient.commands.get(cmd) || BotClient.commands.find(a => a.aliases && a.aliases.includes(cmd));
            if (command) {

                // cooldown handle
                const cooldown_state = await functions.cooldown(user, command.name)
                if(cooldown_state) {
                    return message.reply(cooldown_state)
                }

                try {
                    message.isInteraction = false
                    command.execute(message, args, BotClient, functions);
                    console.log(functions.getTime() + `[${global.shardId}][INFO] ${message.author.tag} issued command ${cmd} in ${message.guild.name}. ` + `(${message})`);
                } catch (err) {
                    message.reply(`There was an error executing this command. (${err})`);
                    console.error(functions.getTime() + `[${global.shardId}][ERROR] ${message.author.tag} issued command ${cmd} in ${message.guild.name} and returned an error: "${err}".`)
                }
            }
        }
        functions.updateAvatar(message.author.id, message.author.avatarURL({ dynamic: true }))
        functions.updateTag(message.author.id, message.author.tag)
    } catch (err) {
        console.error(functions.getTime() + `[${global.shardId}][ERROR] ${message.author.tag} triggered messageCreate event and returned an error: "${err}".`);
    }
}