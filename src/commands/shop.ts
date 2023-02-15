import {
  CommandInteraction,
  MessageEmbed,
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
    const count = await SQL(
      `SELECT count(id) as count FROM items WHERE shop=1 AND stock!=0`
    );
    const maxPage = Math.ceil(count[0].count / 5) - 1;
    const getItems = async (page = 0) => {
      const all = await SQL(
        `SELECT * FROM items WHERE shop=1 AND stock!=0 LIMIT ${page * 5}, 5`
      );
      return all;
    };
    let items = await getItems(currentPage);

    const ShopEmbed = new MessageEmbed()
      .setColor("#ff00e4")
      .setAuthor({
        name: "Shop",
        iconURL: "https://skippies.fun/discord/SoapBOT/images/soap.png",
      })
      .setDescription("Currently available items")
      .setFooter({ text: `Page ${currentPage + 1}/${maxPage + 1}` });

    items.forEach((i: any) => {
      ShopEmbed.addFields(
        { name: "\u200B", value: `**${i.item_name}**\n`, inline: true },
        { name: "\u200B", value: `${i.description}\n`, inline: true },
        {
          name: "\u200B",
          value: `**🧼${i.buy_cost.toLocaleString()}**\n`,
          inline: true,
        }
      );
    });

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("shop_previous" + interaction.id)
        .setLabel("◀")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId("shop_next" + interaction.id)
        .setLabel("▶")
        .setStyle("SECONDARY")
    );

    const reply = (await interaction.reply({
      embeds: [ShopEmbed],
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
        if (i.customId == "shop_next" + interaction.id) {
          currentPage++;
        }
        if (i.customId == "shop_previous" + interaction.id) {
          currentPage--;
        }
        if (currentPage < 0) {
          currentPage = 0;
        }
        if (currentPage > maxPage) {
          currentPage = maxPage;
        }
        items = await getItems(currentPage);

        const ShopPageEmbed = new MessageEmbed()
          .setColor("#ff00e4")
          .setAuthor({
            name: "Shop",
            iconURL: "https://skippies.fun/discord/SoapBOT/images/soap.png",
          })
          .setDescription("Currently available items")
          .setFooter({ text: `Page ${currentPage + 1}/${maxPage + 1}` });

        items.forEach((i: any) => {
          ShopPageEmbed.addFields(
            { name: "\u200B", value: `**${i.item_name}**\n`, inline: true },
            { name: "\u200B", value: `${i.description}\n`, inline: true },
            {
              name: "\u200B",
              value: `**🧼${i.buy_cost.toLocaleString()}**\n`,
              inline: true,
            }
          );
        });
        await reply.edit({ embeds: [ShopPageEmbed] });
        i.deferUpdate().catch();
      } else {
        i.reply({
          content: `These buttons aren't for you!`,
          ephemeral: true,
        }).catch();
      }
    });

    collector.on("end", (collected) => {
      //interaction.channel.send(`Collected ${collected.size} interactions.`);
      const end = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("shop_previous" + interaction.id)
          .setLabel("◀")
          .setStyle("SECONDARY")
          .setDisabled(true),
        new MessageButton()
          .setCustomId("shop_next" + interaction.id)
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
