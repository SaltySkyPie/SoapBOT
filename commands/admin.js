
const { MessageEmbed } = require("discord.js");
module.exports = {
    name: 'admin',
    aliases: ['administrator'],
    cooldown: 0,
    description: 'Command for bot settings',
    async execute(message, args, BotClient, functions) {

        const user = message.member;
        const mention = message.mentions.members.first();

        perms = await functions.getPerms(user.id);
        if (!perms) {
            return message.reply("You don't have permissions to do that");
        }
        if (perms < 100) {
            return message.reply("You don't have permissions to do that");
        }
        if (!args.length) {
            return message.reply("Good, you are admin, but what the hell do you want me to do?");
        }
        switch (args[0].toLowerCase()) {
            case "ban":
                if (!mention) {
                    return message.reply("BRUH... Are you dumb? Try again with an actual person.");
                }
                if (message.mentions.members.size > 1) {
                    return message.reply("You can only mention one person donkey.");
                }
                if (!args[2]) {
                    action = await functions.ban(mention.id, null, user.id)
                    if (action) {
                        const BanEmbed = new MessageEmbed()
                            .setTitle("Admin summary")
                            .setDescription(`**${mention.displayName}** *has been banned by* **${user.displayName}**`)
                            .setColor("#ff00e4");

                        message.channel.send({ embeds: [BanEmbed] });
                    } else {
                        message.reply("There was an error duting the database query :(");
                    }
                } else {
                    const reasonasync = async () => {
                        let full = "";
                        for (let i = 2; i < args.length; i++) {
                            full += args[i] + " ";
                        }
                        return (full)
                    }
                    reason = await reasonasync()

                    action = await functions.ban(mention.id, reason, user.id)
                    if (action) {
                        const BanEmbed1 = new MessageEmbed()
                            .setTitle("Admin summary")
                            .setDescription(`**${mention.displayName}** *has been banned by* **${user.displayName}** *for* "**${reason}**"`)
                            .setColor("#ff00e4");

                        message.channel.send({ embeds: [BanEmbed1] });

                    } else {
                        message.reply("There was an error duting the database query :(");
                    }
                }
                break;
            case "unban":
                if (!mention) {
                    return message.reply("BRUH... Are you dumb? Try again with an actual person.");
                }
                if (message.mentions.members.size > 1) {
                    return message.reply("You can only mention one person donkey.");
                }

                result = await functions.unban(mention.id)
                if (result) {
                    const UnBanEmbed = new MessageEmbed()
                        .setTitle("Admin summary")
                        .setDescription(`**${mention.displayName}** *has been unbanned by* **${user.displayName}**`)
                        .setColor("#ff00e4");

                    message.channel.send({ embeds: [UnBanEmbed] });
                } else {
                    message.reply(`${mention.displayName} isn't even banned lol`);
                }
                break;
            case "restart":

                let status = await functions.getServerCount(BotClient).catch(() => { return false });
                if(!status) {
                    return message.reply("Shards can be restarted after all of them are loaded.");
                }
                const RestartEmbed = new MessageEmbed()
                    .setTitle("Admin summary")
                    .setDescription(`Shard ${global.shardId} is restarting...`)
                    .setColor("#ff00e4");


                message.channel.send({ embeds: [RestartEmbed] }).then(() => {
                    console.log(`${functions.getTime()}[${global.shardId}][INFO] ${message.author.tag} is restarting Shard ${global.shardId}...`);
                    BotClient.destroy();
                    process.exit(1)
                });
                break;
            case "points":
                if (!mention) {
                    return message.reply("BRUH... Are you dumb? Try again with an actual person.");
                }
                if (!args[2]) {
                    return message.reply("You need to define what to do with the points lol");
                }
                if (!args[3] || !Number.isInteger(parseInt(args[3]))) {
                    return message.reply("You need to define what to do with the points lol");

                }
                let points = 0
                switch (args[2]) {
                    case "add":
                        points = await functions.getPoints(mention.id);
                        if (points || points == 0)
                            await functions.setPoints(mention.id, (points + parseInt(args[3])))
                        else {
                            return message.reply("BRUH... Are you dumb? Try again with an actual person.");
                        }

                        const Embed1 = new MessageEmbed()
                            .setTitle("Admin summary")
                            .setDescription(`You added 🧼**${parseInt(args[3]).toLocaleString()}** to ${mention}`)
                            .setColor("#ff00e4");

                        message.channel.send({ embeds: [Embed1] });
                        break;
                    case "remove":
                        points = await functions.getPoints(mention.id);
                        if (points || points == 0)
                            await functions.setPoints(mention.id, (points - parseInt(args[3])))
                        else {
                            return message.reply("BRUH... Are you dumb? Try again with an actual person.");
                        }

                        const Embed2 = new MessageEmbed()
                            .setTitle("Admin summary")
                            .setDescription(`You removed 🧼**${parseInt(args[3]).toLocaleString()}** from ${mention}`)
                            .setColor("#ff00e4");

                        message.channel.send({ embeds: [Embed2] });
                        break;
                    case "set":
                        await functions.setPoints(mention.id, parseInt(args[3]))

                        const Embed3 = new MessageEmbed()
                            .setTitle("Admin summary")
                            .setDescription(`You changed balance to 🧼**${parseInt(args[3]).toLocaleString()}** for ${mention}`)
                            .setColor("#ff00e4");

                        message.channel.send({ embeds: [Embed3] });
                        break;
                    default:
                        message.reply("You need to define what to do with the points lol");
                }
                break;
            default:
                message.reply("Good, you are admin, but what the hell do you want me to do coz this admin command doesn't even exist lmao");
        }
    }
}