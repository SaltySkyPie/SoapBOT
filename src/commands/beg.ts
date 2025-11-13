import { CommandInteraction, EmbedBuilder } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import setPoints from "../functions/setPoints.js";
import getPoints from "../functions/getPoints.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    const random = Math.round(Math.random() * 1000 + 1);

    await setPoints(
      interaction.user.id,
      (await getPoints(interaction.user.id)) + random
    );

    const BegEmbed = new EmbedBuilder()
      .setTitle(`You begged and received **🧼${random.toLocaleString()}**!`)
      .setDescription(`Now that you have some money go buy something!`)
      .setColor("#ff00e4");

    interaction.reply({ embeds: [BegEmbed] });

    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }
}
