const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'coinflip',
    aliases: [],
    slash: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Coinflip')
        .addStringOption(option => option.setName('bet').setDescription('bet').setRequired(true)
            .addChoice('heads', 'heads')
            .addChoice('tails', 'tails'))
        .addStringOption(option => option.setName('soapbet').setDescription('how much soap do you bet?').setRequired(true)),
    async execute(message, args, BotClient, functions) {
        const success = Math.round(Math.random());
        const avatar = await message.author.displayAvatarURL({ dynamic: true })

        let x = 1
        // logic
        if (args.length > 1) {
            const last = args.pop()
            const try_amount = await functions.decodeNumber(last)
            //console.log(try_amount)
            if (try_amount && typeof try_amount === 'number' && !isNaN(try_amount)) {
                x = try_amount
            } else {
                args.push(last)
            }
        }


        const bet_amount = x
        const choice = args.join(' ')
        //console.log(bet_amount)
        if (!choice) {
            return message.reply("Pick either heads or tails... lol")
        }
        if (choice != "heads" && choice != "tails") {
            return message.reply("Pick either heads or tails... lol")
        }


        const user_points = await functions.getPoints(message.author.id)
        if (user_points < bet_amount) {
            return message.reply(`You don't have enough soap to do that......`)
        }
        await functions.setPoints(message.author.id, (user_points - bet_amount))
        const flipping = new MessageEmbed()
            .setImage('https://skippies.fun/discord/soapbot/gifs/flip.gif')
            .setTitle(`${message.member.displayName}`)
            .setAuthor({ name: `${message.member.displayName}'s coin flip`, iconURL: avatar })
            .setDescription(`is betting 🧼**${bet_amount.toLocaleString()}** on ${choice}.`)
            .setColor("#ff00e4")
        let r
        if (message.isInteraction) {
            r = await message.reply({ embeds: [flipping], fetchReply: true });
        } else {
            r = await message.reply({ embeds: [flipping] });
        }
        let result_image
        if (success) {
            result_image = "https://skippies.fun/discord/soapbot/gifs/flip-success.gif"
        } else {
            if (choice == "heads") {
                result_image = "https://skippies.fun/discord/soapbot/gifs/heads-fail.gif"
            } else {
                result_image = "https://skippies.fun/discord/soapbot/gifs/tails-fail.gif"
            }
        }



        const reply = r
        const result = new MessageEmbed()
            .setColor("#ff00e4")
            .setTitle(`${success ? 'You won the coin flip!' : 'You lost the coin flip!'}`)
            .setAuthor({ name: `${message.member.displayName}'s coin flip`, iconURL: avatar })
            .setDescription(success ? `You earned 🧼**${(bet_amount * 2).toLocaleString()}**!` : `You lost 🧼**${(bet_amount).toLocaleString()}**!`)
            .setImage(result_image)


        setTimeout(async() => {
            reply.edit({ embeds: [result] })
            if (success) {
                const user_points = await functions.getPoints(message.author.id)
                await functions.setPoints(message.author.id, (user_points + (2 * bet_amount)))
            }
        }, 2750);
    }
}