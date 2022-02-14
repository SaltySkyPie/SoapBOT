const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'rich', 'lead'],
    cooldown: 0,
    description: 'Basic leaderboard command',
    async execute(message, args, BotClient, functions) {

        const guild = message.guild
        let members = ""
        let points = ""

        const getUsers = async () => {
            let i = 0;
            let memberpoints = new Map();
            for (const u of guild.members.cache) {
                result = await functions.SQL(`SELECT points FROM users WHERE user_id=?`, [u[1].user.id])
                if (!u[1].user.bot) {
                    if (result.length > 0) {
                        memberpoints.set(u[1].user.id, result[0].points);
                    }
                }
                if (i >= (guild.members.cache.size - 1)) {
                    return (memberpoints);
                }
                i++;
            }
        }
        memberpoints = await getUsers();
        const sorted = new Map([...memberpoints.entries()].sort((a, b) => b[1] - a[1]));
        let i = 0;
        let desc = "";
        sorted.forEach((value, key) => {
            if (i < 10) {
                members += `#${i + 1} **<@${key}>**\n`
                points += `🧼 ${value.toLocaleString()}\n`
            }
            if (message.author.id === key) {
                desc = `You are #${i + 1}`
            }
            i++;
        })
        const LeaderboardEmbed = new MessageEmbed()
            .setColor("#ff00e4")
            .setAuthor({ name: `Leaderboard for ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
            .addFields({ name: '\u200B', value: members, inline: true }, { name: '\u200B', value: points, inline: true })
            .setDescription(desc);

        message.channel.send({ embeds: [LeaderboardEmbed] });

    }
}