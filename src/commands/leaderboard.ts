import { Collection, CommandInteraction, MessageEmbed } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import SQL from "../functions/SQL.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    const guild = interaction.guild;

    if (!guild) {
      interaction.reply({ content: `This command must be executed in guild.` });
      return false;
    }

    const members = new Array();
    const nicknames = new Collection();

    for (const [snowflake, member] of guild?.members.cache!) {
      if (!snowflake || !member) continue;
      members.push(snowflake);
      member.user.bot ? null : nicknames.set(member.id, member.displayName);
    }

    const member_points = await SQL(
      "SELECT u.user_id, u.points, @rownum := @rownum + 1 AS rank FROM users u, (SELECT @rownum := 0) r WHERE user_id IN (?) ORDER BY u.points DESC LIMIT 10",
      [members]
    );

    const LeaderboardEmbed = new MessageEmbed()
      .setColor("#ff00e4")
      .setAuthor({
        name: `Leaderboard for ${guild!.name!}`,
        iconURL: guild!.iconURL({ dynamic: true })!,
      });

    for (const position of member_points) {
      const nickname = nicknames.get(position.user_id);

      if (!nickname) continue;

      LeaderboardEmbed.addFields({
        name: "\u200B",
        value: `**#${
          position.rank
        }** **${nickname}** - 🧼 ${position.points.toLocaleString()}`,
        inline: false,
      });

      if (position.user_id === interaction.user.id) {
        LeaderboardEmbed.setDescription(`You are #${position.rank}`);
      }
    }

    interaction.reply({ embeds: [LeaderboardEmbed] });

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
