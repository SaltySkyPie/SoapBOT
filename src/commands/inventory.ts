import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton, Message, GuildMember } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from '@discordjs/builders'
import Command from "../types/Command.js";
import SQL from "../functions/SQL.js";
import getUserData from "../functions/getUserData.js";


export default class BotCommand extends Command {

    constructor(id: number, name: string, description: string) {
        super(id, name, description)
    }
    async execute(client: SoapClient, interaction: CommandInteraction) {

        let user = interaction.options.getMember("user") as GuildMember
        if (!user) {
            user = interaction.member as GuildMember
        }

        const avatar = user.user.displayAvatarURL({ dynamic: true })
        const db_user = await getUserData(user.id)

        let currentPage = 0;
        const count: any = await SQL(`SELECT count(id) as count FROM inventory WHERE user_id=? AND amount>0`, [db_user.id]);
        const maxPage = Math.ceil(count[0].count / 5) - 1;
        const getItems = async (page = 0) => {
            const all = await SQL(`SELECT *, inventory.amount FROM items INNER JOIN inventory ON items.id=inventory.item_id WHERE inventory.user_id=? AND inventory.amount>0 LIMIT ${page * 5}, 5`, [db_user.id])
            return all
        }

        const InventoryEmbed = new MessageEmbed()
            .setColor("#ff00e4")
            .setAuthor({ name: `${user.displayName}'s inventory`, iconURL: avatar })
            .setFooter({ text: `Page ${currentPage + 1}/${maxPage + 1}` });

        let items = await getItems(currentPage);
        if (!items.length) {
            return interaction.reply(`This person is litterally homeless. No items whatsoever lmao`)
        }

        items.forEach((i: any) => {
            InventoryEmbed.addFields({ name: '\u200B', value: `**${i.item_name}**\n`, inline: true }, { name: '\u200B', value: `${i.description}\n`, inline: true }, { name: '\u200B', value: `**${(i.amount).toLocaleString()}**\n`, inline: true })
        });

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("inv_previous" + interaction.id)
                .setLabel("◀")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId("inv_next" + interaction.id)
                .setLabel("▶")
                .setStyle("SECONDARY")
        );

        const reply = await interaction.reply({ embeds: [InventoryEmbed], components: [row], fetchReply: true }) as Message

        const collector = interaction.channel!.createMessageComponentCollector({
            componentType: 'BUTTON',
            idle: 20000
        })
        collector.on('collect', async (i) => {
            if (!i.customId.includes(interaction.id)) {
                return
            }
            if (i.user.id === interaction.user.id) {
                //i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
                if (i.customId == "inv_next" + interaction.id) {
                    currentPage++
                }
                if (i.customId == "inv_previous" + interaction.id) {
                    currentPage--
                }
                if (currentPage < 0) {
                    currentPage = 0
                }
                if (currentPage > maxPage) {
                    currentPage = maxPage
                }
                items = await getItems(currentPage);

                const InventoryPageEmbed = new MessageEmbed()
                    .setColor("#ff00e4")
                    .setAuthor({ name: `${user.displayName}'s inventory`, iconURL: avatar })
                    .setFooter({ text: `Page ${currentPage + 1}/${maxPage + 1}` });

                items.forEach((i: any) => {
                    InventoryPageEmbed.addFields({ name: '\u200B', value: `**${i.item_name}**\n`, inline: true }, { name: '\u200B', value: `${i.description}\n`, inline: true }, { name: '\u200B', value: `**${(i.amount).toLocaleString()}**\n`, inline: true })
                });
                await reply.edit({ embeds: [InventoryPageEmbed] })
                i.deferUpdate().catch()
            } else {
                i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
            }
        });

        collector.on('end', collected => {
            //interaction.channel.send(`Collected ${collected.size} interactions.`);
            const end = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("inv_previous" + interaction.id)
                    .setLabel("◀")
                    .setStyle("SECONDARY")
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId("inv_next" + interaction.id)
                    .setLabel("▶")
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            );
            reply.edit({ components: [end] })
        });


        return true
    }

    async getSlash(): Promise<SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">> {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option => option.setName('user').setDescription('User').setRequired(false));
    }
}


