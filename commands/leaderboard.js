const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'rich', 'lead'],
    slash: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Server leaderboard'),
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

        const LeaderboardEmbed = new MessageEmbed()
            .setColor("#ff00e4")
            .setAuthor({ name: `Leaderboard for ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
        //.addFields({ name: '\u200B', value: members, inline: true }, { name: '\u200B', value: points, inline: true })

        memberpoints = await getUsers();
        const sorted = new Map([...memberpoints.entries()].sort((a, b) => b[1] - a[1]));
        let i = 0;
        sorted.forEach((value, key) => {
            if (i < 10) {
                /*members += `#${i + 1} **<@${key}>** - `
                points += `🧼 ${value.toLocaleString()}`*/
                LeaderboardEmbed.addFields({ name: '\u200B', value: `#${i + 1} **<@${key}>** - 🧼 ${value.toLocaleString()}`, inline: false })
            }
            if (message.author.id === key) {

                LeaderboardEmbed.setDescription(`You are #${i + 1}`);
            }
            i++;
        })
        message.reply({ embeds: [LeaderboardEmbed] });

    }
}