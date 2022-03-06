const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'inventory',
    aliases: ['inv'],
    slash: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Shows inventory')
        .addUserOption(option => option.setName('user').setDescription('User').setRequired(false)),
    async execute(message, args, BotClient, functions) {
        if (message.mentions.members.size > 1 || args.length > 1) {
            return message.reply("You can only mention one person donkey.");
        }
        const mention = message.mentions.members.first() || message.member;
        const avatar = await mention.user.displayAvatarURL({ dynamic: true })
        const user = await functions.getUserData(mention.id)

        let currentPage = 0;
        const count = await functions.SQL(`SELECT count(id) as count FROM inventory WHERE user_id=${user.id} AND amount>0`);
        const maxPage = Math.ceil(count[0].count / 5) - 1;
        const getItems = async (page = 0) => {
            const all = await functions.SQL(`SELECT *, inventory.amount FROM items INNER JOIN inventory ON items.id=inventory.item_id WHERE inventory.user_id=${user.id} AND inventory.amount>0 LIMIT ${page * 5}, 5`)
            return all
        }
        items = await getItems(currentPage);
        if (!items.length) {
            return message.reply(`This person is litterally homeless. No items whatsoever lmao`)
        }
        const ShopEmbed = new MessageEmbed()
            .setColor("#ff00e4")
            .setAuthor({ name: `${mention.displayName}'s inventory`, iconURL: avatar })
            .setFooter(`Page ${currentPage + 1}/${maxPage + 1}`);

        items.forEach(i => {
            ShopEmbed.addFields({ name: '\u200B', value: `**${i.item_name}**\n`, inline: true }, { name: '\u200B', value: `${i.description}\n`, inline: true }, { name: '\u200B', value: `**${i.amount}**\n`, inline: true })
        });

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("inv_previous" + message.id)
                .setLabel("◀")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId("inv_next" + message.id)
                .setLabel("▶")
                .setStyle("SECONDARY")
        );
        let r
        if (message.isInteraction) {
            r = await message.reply({ embeds: [ShopEmbed], components: [row], fetchReply: true });
        } else {
            r = await message.reply({ embeds: [ShopEmbed], components: [row] });
        }
        const reply = r

        const collector = message.channel.createMessageComponentCollector({
            componentType: 'BUTTON',
            idle: 20000
        })
        collector.on('collect', async (i) => {
            if (!i.customId.includes(message.id)) {
                return
            }
            if (i.user.id === message.author.id) {
                //i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
                if (i.customId == "inv_next" + message.id) {
                    currentPage++
                }
                if (i.customId == "inv_previous" + message.id) {
                    currentPage--
                }
                if (currentPage < 0) {
                    currentPage = 0
                }
                if (currentPage > maxPage) {
                    currentPage = maxPage
                }
                items = await getItems(currentPage);

                const ShopPageEmbed = new MessageEmbed()
                    .setColor("#ff00e4")
                    .setAuthor({ name: `${mention.displayName}'s inventory`, iconURL: avatar })
                    .setFooter(`Page ${currentPage + 1}/${maxPage + 1}`);

                items.forEach(i => {
                    ShopPageEmbed.addFields({ name: '\u200B', value: `**${i.item_name}**\n`, inline: true }, { name: '\u200B', value: `${i.description}\n`, inline: true }, { name: '\u200B', value: `**${i.amount}**\n`, inline: true })
                });
                await reply.edit({ embeds: [ShopPageEmbed] })
                i.deferUpdate().catch()
            } else {
                i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
            }
        });

        collector.on('end', collected => {
            //message.channel.send(`Collected ${collected.size} interactions.`);
            const end = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("inv_previous" + message.id)
                    .setLabel("◀")
                    .setStyle("SECONDARY")
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId("inv_next" + message.id)
                    .setLabel("▶")
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            );
            reply.edit({ components: [end] })
        });

    }
}