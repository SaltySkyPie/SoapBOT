import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import prisma from "../lib/prisma.js";
import { createPaginatedEmbed } from "../utils/pagination.js";

interface ShopItem {
  itemName: string;
  description: string;
  buyCost: number;
}

export default class Shop extends Command {
  readonly name = "shop";
  readonly description = "View items available for purchase";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const pageSize = 5;
    const totalCount = await prisma.items.count({
      where: { shop: 1, stock: { not: 0 } },
    });

    const fetchItems = async (page: number): Promise<ShopItem[]> => {
      const items = await prisma.items.findMany({
        where: { shop: 1, stock: { not: 0 } },
        skip: page * pageSize,
        take: pageSize,
      });
      return items.map((item) => ({
        itemName: item.item_name ?? "",
        description: item.description ?? "",
        buyCost: Number(item.buy_cost),
      }));
    };

    const buildEmbed = (items: ShopItem[], currentPage: number, maxPage: number): EmbedBuilder => {
      const embed = this.createEmbed()
        .setAuthor({
          name: "Shop",
          iconURL: "https://cdn.saltyskypie.com/soapbot/images/soap.png",
        })
        .setDescription("Currently available items")
        .setFooter({ text: `Page ${currentPage + 1}/${maxPage + 1}` });

      for (const item of items) {
        embed.addFields(
          { name: "\u200B", value: `**${item.itemName}**\n`, inline: true },
          { name: "\u200B", value: `${item.description}\n`, inline: true },
          { name: "\u200B", value: `**${item.buyCost.toLocaleString()}**\n`, inline: true }
        );
      }

      return embed;
    };

    return createPaginatedEmbed({
      interaction,
      fetchItems,
      totalCount,
      pageSize,
      buildEmbed,
      customIdPrefix: "shop",
    });
  }

  async getSlash() {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
  }
}
