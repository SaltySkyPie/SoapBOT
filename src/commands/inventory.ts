import { ChatInputCommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import prisma from "../lib/prisma.js";
import getUserData from "../functions/getUserData.js";
import { createPaginatedEmbed } from "../utils/pagination.js";

interface InventoryItem {
  itemName: string;
  description: string;
  amount: number;
}

export default class Inventory extends Command {
  readonly name = "inventory";
  readonly description = "View your or someone else's inventory";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    let user = interaction.options.getMember("user") as GuildMember;
    if (!user) user = interaction.member as GuildMember;

    const avatar = user.user.displayAvatarURL();
    const dbUser = await getUserData(user.id);

    if (!dbUser) {
      interaction.reply("This person doesn't exist in our database.");
      return false;
    }

    const pageSize = 5;
    const totalCount = await prisma.inventory.count({
      where: { user_id: dbUser.id, amount: { gt: 0 } },
    });

    if (totalCount === 0) {
      interaction.reply("This person is litterally homeless. No items whatsoever lmao");
      return false;
    }

    const fetchItems = async (page: number): Promise<InventoryItem[]> => {
      const items = await prisma.inventory.findMany({
        where: { user_id: dbUser.id, amount: { gt: 0 } },
        include: { items: true },
        skip: page * pageSize,
        take: pageSize,
      });
      return items.map((inv) => ({
        itemName: inv.items.item_name ?? "",
        description: inv.items.description ?? "",
        amount: inv.amount ?? 0,
      }));
    };

    const buildEmbed = (
      items: InventoryItem[],
      currentPage: number,
      maxPage: number
    ): EmbedBuilder => {
      const embed = this.createEmbed()
        .setAuthor({ name: `${user.displayName}'s inventory`, iconURL: avatar })
        .setFooter({ text: `Page ${currentPage + 1}/${maxPage + 1}` });

      for (const item of items) {
        embed.addFields(
          { name: "\u200B", value: `**${item.itemName}**\n`, inline: true },
          { name: "\u200B", value: `${item.description}\n`, inline: true },
          { name: "\u200B", value: `**${item.amount.toLocaleString()}**\n`, inline: true }
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
      customIdPrefix: "inv",
    });
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) => option.setName("user").setDescription("User").setRequired(false));
  }
}
