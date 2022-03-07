const { Collection } = require("discord.js");

module.exports = async (BotClient, functions, interaction) => {
    if (interaction.isCommand()) {
        //console.log(interaction.reply)
        //console.log(interaction.options)
        const command = BotClient.commands.get(interaction.commandName) || BotClient.commands.find(a => a.aliases && a.aliases.includes(interaction.commandName));
        //console.log(command)
        if (command) {
            //convert interaction to message object:
            const message = interaction
            message.isInteraction = true
            message.author = interaction.user
            message.member = interaction.member
            message.id = interaction.id
            message.guild = interaction.guild
            message.channel = interaction.channel
            message.mentions = {
                members: new Collection(),
                users: new Collection()
            }
            message.edit = interaction.editReply
            message.reply = interaction.reply
            message.IObject = interaction

            //console.log("Message object:", message)
            const args = []

            for (const field of message.IObject.options.data) {
                //console.log("field", field)
                if(field.member) {
                    message.mentions.members.set(field.value, field.member)
                }
                if(field.member) {
                    message.mentions.members.set(field.value, field.member)
                }
                args.push(field.value)
            }
            //console.log(args)
            //console.log(message.mentions.members)



            //console.log("IObject options", message.IObject.options.data)



            if (!message.guild.me.permissionsIn(message.channel).has(['SEND_MESSAGES'])) {
                return console.error(functions.getTime() + `[${global.shardId}][ERROR] ${message.author.tag} tried to issue command but cannot reply: "Missing permissions".`);
            }



            let ban = await functions.checkBan(message.author.id)

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
            // cooldown handle
            const cooldown_state = await functions.cooldown(user, command.name)
            if(cooldown_state) {
                return interaction.reply(cooldown_state)
            }

            try {
                command.execute(message, args, BotClient, functions);
                console.log(functions.getTime() + `[${global.shardId}][INFO] ${message.author.tag} issued command ${command.name} in ${message.guild.name}. ` + `(${message})`);
            } catch (err) {
                console.error(functions.getTime() + `[${global.shardId}][ERROR] ${message.author.tag} issued command ${command.name} in ${message.guild.name} and returned an error: "${err}".`)
            }

            functions.updateAvatar(message.author.id, message.author.avatarURL({ dynamic: true }))
            functions.updateTag(message.author.id, message.author.tag)
        }
    }
}