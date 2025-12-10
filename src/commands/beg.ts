import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import setPoints from "../functions/setPoints.js";
import getPoints from "../functions/getPoints.js";

export default class Beg extends Command {
  readonly name = "beg";
  readonly description = "Beg for some soap";
  readonly cooldown = 30; // 30 seconds

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const random = Math.round(Math.random() * 1000 + 1);
    await setPoints(interaction.user.id, (await getPoints(interaction.user.id)) + random);

    const embed = this.createEmbed()
      .setTitle(`You begged and received **🧼${random.toLocaleString()}**!`)
      .setDescription(`Now that you have some money go buy something!`);

    interaction.reply({ embeds: [embed] });
    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
  }
}
