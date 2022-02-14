const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'kill',
    aliases: ['murder'],
    cooldown: 1,
    description: 'Basic kill command',
    async execute(message, args, BotClient, functions) {

        const user = message.member;
        const mention = message.mentions.members.first();

        if (!mention) {
            return message.reply("You actually need a target to kill... thats a common sense tbh");
        }
        if (message.mentions.members.size > 1 || args.length > 1) {
            return message.reply("You can only mention one person donkey.");
        }

        if (user.id == mention.id) {
            return message.reply("...");
        }

        kill = await functions.SQL("SELECT message FROM kill_msg ORDER BY RAND() LIMIT 1", []);
        
        msg = kill[0].message.toString().replaceAll('{1}', `**${user.displayName}**`).replaceAll('{0}', `**${mention.displayName}**`);
        const Embed = new MessageEmbed()
            .setTitle(":knife: Kill summary :knife:")
            .setDescription(msg)
            .setColor("#ff00e4");

        message.channel.send({ embeds: [Embed] });
    }
}