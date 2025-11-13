import { CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import getPoints from "../functions/getPoints.js";
import getBank from "../functions/getBank.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    let user: GuildMember = interaction.options.getMember(
      "user"
    ) as GuildMember;
    if (!user) {
      user = interaction.member as GuildMember;
    }

    const points = await Promise.all([getPoints(user.id), getBank(user.id)]);

    const BalanceEmbed = new EmbedBuilder()
      .setTitle(`${user.displayName}'s balance`)
      .setDescription(
        `Hand: 🧼**${points[0].toLocaleString()}**\nStash: 🧼**${points[1][0].toLocaleString()}** / 🧼**${points[1][1].toLocaleString()}**`
      )
      .setColor("#ff00e4");

    interaction.reply({ embeds: [BalanceEmbed] });

    return true;
  }

  async getSlash(): Promise<
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
  > {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) =>
        option.setName("user").setDescription("User").setRequired(false)
      );
  }
}
