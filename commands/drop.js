const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    name: 'drop',
    aliases: [],
    cooldown: 90,
    description: 'Basic drop command',
    async execute(message, args, BotClient, functions) {

        const user = message.member;
        const mention = message.mentions.members.first();

        if (!mention) {
            return message.reply("Soap on a rope saves the day. Try again with an actual person.");
        }
        if (message.mentions.members.size > 1 || args.length > 1) {
            return message.reply("You can only mention one person donkey.");
        }

        if (user.id == mention.id) {
            return message.reply("Get lost!");
        }
        let bruh = await functions.getSoapstatus(user.id)
        if (bruh != 0) {
            return message.reply("You need to pick up your soap first...");
        }
        let result = await functions.getSoapstatus(mention.id)
        if (result != 0) {
            return message.reply("Do you not see their soap on the ground already?");
        }
        const dbUser = await functions.getUserData(mention.id)
        const checkRope = await functions.SQL("SELECT id FROM active_items WHERE user_id=? AND item_id=1", [dbUser.id])
        if (checkRope.length) {
            await functions.SQL("DELETE FROM active_items WHERE item_id=1 AND user_id=?", [dbUser.id])
            const fail_dm = new MessageEmbed()
                .setTitle(` ${user.displayName} (${user.user.username}#${user.user.discriminator}) tried to drop your 🧼 in ${message.guild.name} but failed due to you having Rope equipped!`)
                .setColor("#ff00e4")
                .setDescription(`https://discord.com/channels/${user.guild.id}/${message.channel.id}/${message.id}, <#${message.channel.id}>`)
            try {
                await mention.createDM()
                await mention.send({ embeds: [fail_dm] })
            } catch (e) {
                null
            }
            return message.reply(`You tried to drop **${mention.displayName}**'s soap, but didn't realize they had very thicc rope on it. You failed lmao.`)
        }

        result = await functions.SQL("SELECT link FROM gifs WHERE purpose=0 ORDER BY RAND() LIMIT 1", [])

        let image = result[0].link;
        const DropEmbed = new MessageEmbed()
            .setTitle("Oh no!")
            .setDescription(`**${mention.displayName}** dropped the soap! Type "${global.prefix}pickup" to pick up the soap!\nYou have 5 minutes to pick up your soap!`)
            .setImage(image)
            .setColor("#ff00e4");

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("soap_pickup" + message.id)
                .setLabel("PICK UP!")
                .setStyle("SUCCESS")
        );
        // ||\`\`\`https://discord.com/channels/${user.guild.id}/${message.channel.id}/${message.id}, <#${message.channel.id}>\`\`\`||`

        const dm = new MessageEmbed()
            .setTitle(` ${user.displayName} (${user.user.username}#${user.user.discriminator}) dropped your 🧼 in ${message.guild.name}!`)
            .setColor("#ff00e4")
            .setDescription(`https://discord.com/channels/${user.guild.id}/${message.channel.id}/${message.id}, <#${message.channel.id}>`)
        try {
            await mention.createDM()
            await mention.send({ embeds: [dm] })
        } catch (e) {
            null
        }
        await functions.setSoapstatus(mention.id, 1)
        const reply = await message.channel.send({ embeds: [DropEmbed], components: [row] });
        /*const filter = (interaction) => {
            if (interaction.user.id === mention.id) {
                return true
            } else {
                interaction.reply({ content: `This button is not for you. Dummy!`, ephemeral: true }); return false
            }
        };*/
        const collector = message.channel.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 300000
        })
        let picked_up = false
        collector.on('collect', async (i) => {
            if (i.customId !== "soap_pickup" + message.id) {
                return;
            }
            if (i.user.id !== mention.id) {
                i.reply({ content: `This button is not for you. Dummy!`, ephemeral: true });
                return;
            }
            picked_up = true
            const pickup_row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("soap_pickup" + message.id)
                    .setLabel("PICKING UP!")
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            );
            reply.edit({ components: [pickup_row] })
            i.deferUpdate()



            let image = await functions.SQL("SELECT link FROM gifs WHERE purpose=1 ORDER BY RAND() LIMIT 1", [])
            image = image[0].link;
            const PickUpEmbed = new MessageEmbed()
                .setTitle("Oh yeah!")
                .setDescription(`**${mention.displayName}** is picking up their soap! Click the "DADDY" button to get some 🧼!\nYou have 10 seconds to do so!`)
                .setImage(image)
                .setColor("#ff00e4");

            const pup_row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("soap_daddy" + message.id)
                    .setLabel("DADDY! 😏")
                    .setStyle("SUCCESS")
            );

            const pickup_msg = await message.channel.send({ embeds: [PickUpEmbed], components: [pup_row] })

            const pickup_collector = message.channel.createMessageComponentCollector({
                max: 1,
                componentType: 'BUTTON',
                time: 10000
            })

            pickup_collector.on('collect', async (i) => {
                if (i.customId !== "soap_daddy" + message.id) {
                    return;
                }
                const earned = Math.floor(Math.random() * (1500 - 750 + 1) + 750);
                let points = await functions.getPoints(i.member.id)
                await functions.setPoints(i.member.id, points + earned)

                const daddy_row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("soap_daddy" + message.id)
                        .setLabel("DADDY! 😏")
                        .setStyle("SECONDARY")
                        .setDisabled(true)
                );
                pickup_msg.edit({ components: [daddy_row] })

                await message.channel.send(`**${i.member.displayName}** used the **DADDY** spell and obtained 🧼**${earned.toLocaleString()}**!`);

                i.deferUpdate()
            })

            pickup_collector.on('end', async () => {
                const m_earned = Math.floor(Math.random() * (1500 - 750 + 1) + 750);
                let points = await functions.getPoints(mention.id)
                functions.setPoints(mention.id, points + m_earned)
                const daddy_row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("soap_daddy" + message.id)
                        .setLabel("DADDY! 😏")
                        .setStyle("SUCCESS")
                        .setDisabled(true)
                );
                pickup_msg.edit({ components: [daddy_row] })
                setTimeout(() => {
                    message.channel.send(`**${mention.displayName}** has picked up their soap and earned 🧼**${m_earned.toLocaleString()}**!`)
                    functions.setSoapstatus(mention.id, 0)
                }, 1000);
            })
        })

        collector.on('end', async (collected) => {
            if (!picked_up) {
                message.channel.send(`**${mention.displayName}** didn't pick up their soap in time. They lost 🧼**500**. :(`);
                result = await functions.getPoints(mention.id)
                if (result >= 500) {
                    functions.setPoints(mention.id, result - 500);
                } else {
                    functions.setPoints(mention.id, 0);
                }
                mention.send("You didn't pick up your soap in time. You lost 🧼**500**. :(").catch()
                const toolaterow = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("soap_daddy" + message.id)
                        .setLabel(`"TOO LATE!"`)
                        .setStyle("SUCCESS")
                        .setDisabled(true)
                );
                await functions.setSoapstatus(mention.id, 0)
                reply.edit({ components: [toolaterow] })
            }
        })
    }
}