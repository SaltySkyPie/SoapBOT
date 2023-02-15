import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import SQL from "../functions/SQL.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    const target = interaction.options.getMember("user") as GuildMember;
    const user = interaction.member as GuildMember;
    if (!target) {
      interaction.reply({
        content:
          "You actually need a target to kill... thats a common sense tbh",
      });
      return false;
    }

    if (interaction.user.id === target.id) {
      interaction.reply({ content: "You can't kill yourself dummy..." });
      return false;
    }

    const kill = (
      await SQL("SELECT message FROM kill_msg ORDER BY RAND() LIMIT 1", [])
    )[0].message
      .toString()
      .replaceAll("{1}", `**${user.displayName}**`)
      .replaceAll("{0}", `**${target.displayName}**`);

    const KillEmbed = new MessageEmbed()
      .setTitle(":knife: Kill summary :knife:")
      .setDescription(kill)
      .setColor("#ff00e4");

    interaction.reply({ embeds: [KillEmbed] });
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
        option.setName("user").setDescription("Victim").setRequired(true)
      );
  }
}
