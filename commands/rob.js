const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'rob',
    aliases: ['steal'],
    slash: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Steals from a person')
        .addUserOption(option => option.setName('victim').setDescription('Victim').setRequired(true)),
    async execute(message, args, BotClient, functions) {

        const user = message.member;
        const mention = message.mentions.members.first();

        if (!mention) {
            return message.reply("BRUH... Are you dumb? Try again with an actual person.");
        }
        if (message.mentions.members.size > 1 || args.length > 1) {
            return message.reply("You can only mention one person donkey.");
        }

        if (user.id === mention.id) {
            return message.reply("Get lost!");
        }
        sstatus = await functions.getSoapstatus(user.id);
        if (sstatus !== 0) {
            return message.reply(`You need to pick up your soap first :smirk:`);
        }
        //const victim = await functions.getUserData(mention.id)
        //const robber = await functions.getUserData(user.id)
        const [victim, robber] = await Promise.all([functions.getUserData(mention.id), functions.getUserData(user.id)])
        if (!victim) {
            return message.reply(`**${mention.displayName}** doen't even have 🧼**1,000**. Not worth`);
        }
        if (victim.points < 1000) {
            return message.reply(`**${mention.displayName}** doen't even have 🧼**1,000**. Not worth`);
        }
        if (robber.points < 1000) {
            return message.reply(`You need atleast 🧼**1,000** to rob someone. Imagine being so poor lmao`);
        }
        const success = Math.round(Math.random());
        const percent = (Math.floor(Math.random() * 100 + 1)) / 100;
        const checkFCS = await functions.SQL("SELECT id FROM active_items WHERE user_id=? AND item_id=18", [robber.id])
        if (checkFCS.length) {
            return message.reply("You were knocked out. You need to get back on your feet first lmao")
        }
        const checkHardener = await functions.SQL("SELECT id FROM active_items WHERE user_id=? AND item_id=2", [victim.id])
        if (checkHardener.length) {
            await functions.SQL("DELETE FROM active_items WHERE item_id=2 AND user_id=?", [victim.id])
            const dm = new MessageEmbed()
                .setTitle(` ${user.displayName} (${user.user.username}#${user.user.discriminator}) tried to steal from you in ${message.guild.name} but failed due to you having Soap Hardener equipped!`)
                .setColor("#ff00e4")
                .setDescription(`https://discord.com/channels/${user.guild.id}/${message.channel.id}/${message.id}, <#${message.channel.id}>`)
            try {
                await mention.createDM()
                await mention.send({ embeds: [dm] })
            } catch (e) {
                null
            }
            message.reply(`You tried to steal from **${mention.displayName}** but when you tried to lift their soap, you realized it's 69x heavier. You ended up losing **🧼500**.`)

            await Promise.all([functions.setPoints(mention.id, victim.points + 500), functions.setPoints(user.id, robber.points - 500)]);
            return
        }
        if (success) {

            const succ_dm = new MessageEmbed()
                .setTitle(` ${user.displayName} (${user.user.username}#${user.user.discriminator}) stole from you in ${message.guild.name}!`)
                .setColor("#ff00e4")
                .setDescription(`https://discord.com/channels/${user.guild.id}/${message.channel.id}/${message.id}, <#${message.channel.id}>`)
            try {
                await mention.createDM()
                await mention.send({ embeds: [succ_dm] })
            } catch (e) {
                null
            }



            const stolenAmount = Math.round(percent * victim.points);
            message.reply(`You stole 🧼**${stolenAmount.toLocaleString()}** from **${mention.displayName}**! (${Math.round(percent * 100)}% of their total 🧼).`);
            functions.setPoints(mention.id, victim.points - stolenAmount);
            functions.setPoints(user.id, robber.points + stolenAmount);
        } else {

            const fail_dm = new MessageEmbed()
                .setTitle(` ${user.displayName} (${user.user.username}#${user.user.discriminator}) tried to steal from you in ${message.guild.name} but failed!`)
                .setColor("#ff00e4")
                .setDescription(`https://discord.com/channels/${user.guild.id}/${message.channel.id}/${message.id}, <#${message.channel.id}>`)
            try {
                await mention.createDM()
                await mention.send({ embeds: [fail_dm] })
            } catch (e) {
                null
            }


            const lostAmount = Math.round(0.1 * robber.points);
            message.reply(`You tried to steal from **${mention.displayName}** but **slipped** on your soap and paid 🧼**${lostAmount.toLocaleString()}**`);
            functions.setPoints(mention.id, victim.points + lostAmount);
            functions.setPoints(user.id, robber.points - lostAmount);
        }
    }
}