import { Collection, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import prisma from "../lib/prisma.js";

export default class Leaderboard extends Command {
  readonly name = "leaderboard";
  readonly description = "View the server leaderboard";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

    if (!guild) {
      interaction.reply({ content: `This command must be executed in guild.` });
      return false;
    }

    const members = new Array<string>();
    const nicknames = new Collection<string, string>();

    for (const [snowflake, member] of guild.members.cache) {
      if (!snowflake || !member) continue;
      members.push(snowflake);
      if (!member.user.bot) nicknames.set(member.id, member.displayName);
    }

    const users = await prisma.users.findMany({
      where: { user_id: { in: members } },
      orderBy: { points: "desc" },
      take: 10,
      select: { user_id: true, points: true },
    });

    const memberPoints = users.map((u, index) => ({
      user_id: u.user_id,
      points: Number(u.points),
      rank: index + 1,
    }));

    const embed = this.createEmbed().setAuthor({
      name: `Leaderboard for ${guild.name}`,
      iconURL: guild.iconURL() || undefined,
    });

    for (const position of memberPoints) {
      const nickname = nicknames.get(position.user_id!);
      if (!nickname) continue;

      embed.addFields({
        name: "\u200B",
        value: `**#${position.rank}** **${nickname}** - 🧼 ${position.points.toLocaleString()}`,
        inline: false,
      });

      if (position.user_id === interaction.user.id) {
        embed.setDescription(`You are #${position.rank}`);
      }
    }

    interaction.reply({ embeds: [embed] });
    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }
}
