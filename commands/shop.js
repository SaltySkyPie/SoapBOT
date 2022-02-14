const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    name: 'shop',
    aliases: ['store'],
    cooldown: 3,
    description: 'Basic shop command',
    async execute(message, args, BotClient, functions) {
        let currentPage = 0;
        const count = await functions.SQL(`SELECT count(id) as count FROM items WHERE shop=1 AND stock!=0`);
        const maxPage = Math.ceil(count[0].count / 5) - 1;
        const getItems = async (page = 0) => {
            const all = await functions.SQL(`SELECT * FROM items WHERE shop=1 AND stock!=0 LIMIT ${page * 5}, 5`)
            return all
        }
        items = await getItems(currentPage);

        const ShopEmbed = new MessageEmbed()
            .setColor("#ff00e4")
            .setAuthor({ name: "Shop", iconURL: "https://skippies.fun/discord/SoapBOT/images/soap.png" })
            .setDescription("Currently available items")
            .setFooter(`Page ${currentPage + 1}/${maxPage + 1}`);

        items.forEach(i => {
            ShopEmbed.addFields({ name: '\u200B', value: `**${i.item_name}**\n`, inline: true }, { name: '\u200B', value: `${i.description}\n`, inline: true }, { name: '\u200B', value: `**🧼${i.buy_cost.toLocaleString()}**\n`, inline: true })
        });

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("shop_previous" + message.id)
                .setLabel("◀")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId("shop_next" + message.id)
                .setLabel("▶")
                .setStyle("SECONDARY")
        );
        const reply = await message.channel.send({ embeds: [ShopEmbed], components: [row] });

        const collector = message.channel.createMessageComponentCollector({
            componentType: 'BUTTON',
            idle: 20000
        })
        collector.on('collect', async (i) => {
            if (!i.customId.includes(message.id)) {
                return;
            }
            if (i.user.id === message.author.id) {
                //i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
                if (i.customId == "shop_next" + message.id) {
                    currentPage++
                }
                if (i.customId == "shop_previous" + message.id) {
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
                    .setAuthor({ name: "Shop", iconURL: "https://skippies.fun/discord/SoapBOT/images/soap.png" })
                    .setDescription("Currently available items")
                    .setFooter(`Page ${currentPage + 1}/${maxPage + 1}`);

                items.forEach(i => {
                    ShopPageEmbed.addFields({ name: '\u200B', value: `**${i.item_name}**\n`, inline: true }, { name: '\u200B', value: `${i.description}\n`, inline: true }, { name: '\u200B', value: `**🧼${i.buy_cost.toLocaleString()}**\n`, inline: true })
                });
                await reply.edit({ embeds: [ShopPageEmbed] })
                i.deferUpdate().catch()
            } else {
                i.reply({ content: `These buttons aren't for you!`, ephemeral: true }).catch();
            }
        });

        collector.on('end', collected => {
            //message.channel.send(`Collected ${collected.size} interactions.`);
            const end = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("shop_previous" + message.id)
                    .setLabel("◀")
                    .setStyle("SECONDARY")
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId("shop_next" + message.id)
                    .setLabel("▶")
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            );
            reply.edit({ components: [end] })
        });

    }
}