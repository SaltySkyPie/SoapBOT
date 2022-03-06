const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'beg',
    aliases: [],
    slash: new SlashCommandBuilder()
    .setName('beg')
    .setDescription('Begs for a random amount of Soap'),
    async execute(message, args, BotClient, functions) {


        const random = Math.floor(Math.random() * 1000);
        if (random == 0) {

            const BegEmbed = new MessageEmbed()
                .setTitle("You begged and received nothing XD")
                .setDescription(`Go pick up some soap instead :)`)
                .setColor("#ff00e4");

            return message.reply({ embeds: [BegEmbed] });
        }
        result = await functions.SQL(`SELECT points FROM users WHERE user_id="${message.author.id}"`, [])
        if (result.length <= 0) {
            throw "User not found in databse :(";
        }
        let points = result[0].points + random;
        await functions.SQL(`UPDATE users SET points=${points} WHERE user_id="${message.author.id}"`, [])
        const BegEmbed = new MessageEmbed()
            .setTitle(`You begged and received **🧼${random.toLocaleString()}**!`)
            .setDescription(`Now that you have some money go buy something!`)
            .setColor("#ff00e4");

        message.reply({ embeds: [BegEmbed] });
    }
}