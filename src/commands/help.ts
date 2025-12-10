import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import prisma from "../lib/prisma.js";
import { createPaginatedEmbed } from "../utils/pagination.js";

interface HelpItem {
  command: string;
  description: string;
}

export default class Help extends Command {
  readonly name = "help";
  readonly description = "List all available commands";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const pageSize = 5;
    const totalCount = await prisma.command.count();

    const fetchItems = async (page: number): Promise<HelpItem[]> => {
      const commands = await prisma.command.findMany({
        orderBy: { command: "asc" },
        skip: page * pageSize,
        take: pageSize,
      });
      return commands.map((cmd) => ({
        command: cmd.command ?? "",
        description: cmd.description ?? "",
      }));
    };

    const buildEmbed = (items: HelpItem[], currentPage: number, maxPage: number): EmbedBuilder => {
      const embed = this.createEmbed()
        .setAuthor({
          name: "Help",
          iconURL: "https://cdn.saltyskypie.com/soapbot/images/soap.png",
        })
        .setDescription("List of all Soap BOT commands")
        .setFooter({ text: `Page ${currentPage + 1}/${maxPage + 1}` });

      for (const item of items) {
        embed.addFields(
          { name: "\u200B", value: `**/${item.command}**\n`, inline: true },
          { name: "\u200B", value: `${item.description}\n`, inline: true },
          { name: "\u200B", value: `-\n`, inline: true }
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
      customIdPrefix: "help",
    });
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }
}
