import {
  CommandInteraction,
  EmbedBuilder,
  MessageActionRow,
  MessageButton,
  Message,
} from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import SQL from "../functions/SQL.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    let currentPage = 0;
    const count = await SQL(`SELECT count(id) as count FROM commands`);
    const maxPage = Math.ceil(count[0].count / 5) - 1;
    const getItems = async (page = 0) => {
      const all = await SQL(
        `SELECT * FROM commands ORDER BY command LIMIT ${page * 5}, 5`
      );
      return all;
    };
    let items = await getItems(currentPage);

    const HelpEmbed = new EmbedBuilder()
      .setColor("#ff00e4")
      .setAuthor({
        name: "Help",
        iconURL: "https://cdn.saltyskypie.com/soapbot/images/soap.png",
      })
      .setDescription("List of all Soap BOT commands")
      .setFooter({ text: `Page ${currentPage + 1}/${maxPage + 1}` });

    items.forEach((i: any) => {
      HelpEmbed.addFields(
        { name: "\u200B", value: `**/${i.command}**\n`, inline: true },
        { name: "\u200B", value: `${i.description}\n`, inline: true },
        { name: "\u200B", value: `-\n`, inline: true }
      );
    });

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("help_previous" + interaction.id)
        .setLabel("◀")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId("help_next" + interaction.id)
        .setLabel("▶")
        .setStyle("SECONDARY")
    );
    const reply = (await interaction.reply({
      embeds: [HelpEmbed],
      components: [row],
      fetchReply: true,
    })) as Message;
    const collector = interaction.channel!.createMessageComponentCollector({
      componentType: "BUTTON",
      idle: 20000,
    });
    collector.on("collect", async (i) => {
      if (!i.customId.includes(interaction.id)) {
        return;
      }
      if (i.user.id === interaction.user.id) {
        //i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
        if (i.customId == "help_next" + interaction.id) {
          currentPage++;
        }
        if (i.customId == "help_previous" + interaction.id) {
          currentPage--;
        }
        if (currentPage < 0) {
          currentPage = 0;
        }
        if (currentPage > maxPage) {
          currentPage = maxPage;
        }
        items = await getItems(currentPage);

        const HelpPageEmbed = new EmbedBuilder()
          .setColor("#ff00e4")
          .setAuthor({
            name: "Help",
            iconURL: "https://cdn.saltyskypie.com/soapbot/images/soap.png",
          })
          .setDescription("List of all Soap BOT commands")
          .setFooter({ text: `Page ${currentPage + 1}/${maxPage + 1}` });

        items.forEach((i: any) => {
          HelpPageEmbed.addFields(
            { name: "\u200B", value: `**/${i.command}**\n`, inline: true },
            { name: "\u200B", value: `${i.description}\n`, inline: true },
            { name: "\u200B", value: `-\n`, inline: true }
          );
        });
        await reply.edit({ embeds: [HelpPageEmbed] });
        i.deferUpdate();
      } else {
        i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
      }
    });

    collector.on("end", (collected) => {
      //message.channel.send(`Collected ${collected.size} interactions.`);
      const end = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("help_previous" + interaction.id)
          .setLabel("◀")
          .setStyle("SECONDARY")
          .setDisabled(true),
        new MessageButton()
          .setCustomId("help_next" + interaction.id)
          .setLabel("▶")
          .setStyle("SECONDARY")
          .setDisabled(true)
      );
      reply.edit({ components: [end] });
    });

    return true;
  }

  async getSlash(): Promise<
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
  > {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }
}
