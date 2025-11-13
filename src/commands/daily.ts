import { CommandInteraction, EmbedBuilder } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import getPoints from "../functions/getPoints.js";
import setPoints from "../functions/setPoints.js";
import getBaseValue from "../functions/getBaseValue.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    const points_to_add = parseInt(await getBaseValue("daily"));
    await setPoints(
      interaction.user.id,
      (await getPoints(interaction.user.id)) + points_to_add
    );
    const DailyEmbed = new EmbedBuilder()
      .setTitle(`Take your daily soapy reward!`)
      .setDescription(
        `You recieved 🧼**${points_to_add.toLocaleString()}**\nMake sure to check out https://soapbot.saltyskypie.com and vote for Soap BOT for some additional goodies!`
      )
      .setColor("#ff00e4");

    interaction.reply({ embeds: [DailyEmbed] });
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
