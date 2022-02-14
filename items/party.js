const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    name: 'soap party',
    async execute(message, args, BotClient, functions, user) {

        const muser = message.member;
        let result = await functions.SQL("SELECT link FROM gifs WHERE purpose=2 ORDER BY RAND() LIMIT 1", [])

        let image = result[0].link;

        const PartyEmbed = new MessageEmbed()
            .setTitle(`${muser.displayName} is hosting a SOAP PARTY!`)
            .setDescription(`Click the button bellow to join!`)
            .setImage(image)
            .setColor("#ff00e4");

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("party_join" + message.id)
                .setLabel("JOIN THE PARTY!")
                .setStyle("SUCCESS")
        );
        const reply = await message.channel.send({ embeds: [PartyEmbed], components: [row] })

        const collector = message.channel.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 30000
        })
        let joined = 0;
        let joiners = []
        collector.on('collect', async (i) => {
            if (!i.customId.includes(message.id)) {
                return;
            }
            if (i.user.id === message.author.id) {
                //return i.reply({ content: `You are the host of the party..`, ephemeral: true }).catch()
            }
            if (joiners.includes(i.user.id)) {
                return i.reply({ content: `You already joined the party!`, ephemeral: true }).catch()
            } else {
                joiners.push(i.user.id)
            }
            const earned = Math.floor(Math.random() * 1000) + 100;
            await functions.setPoints(i.user.id, (await functions.getPoints(i.user.id)) + earned)
            message.channel.send(`**${i.member.displayName}** joined the **SOAP PARTY** and obtained **🧼${earned}**!`)
            joined++
            i.deferUpdate().catch()
        })

        collector.on('end', (collected) => {
            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("party_join" + message.id)
                    .setLabel("PARTY ENDED!")
                    .setStyle("DANGER")
                    .setDisabled(true)
            );
            reply.edit({ content: "Party ended :(", components: [row] })
            message.channel.send(`**${muser.displayName}**'s party ended with total of **${joined}** participants!`)
        })
    }
}