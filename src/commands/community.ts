import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";

export default class Community extends Command {
  readonly name = "community";
  readonly description = "Join the Soap BOT community server";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const embed = this.createEmbed()
      .setTitle("Join Soap BOT community server!")
      .setDescription("Giveaways, Beta testing and more!\nhttps://discord.gg/y3xMSTrUuD")
      .setThumbnail(client.user?.avatarURL() as string);

    interaction.reply({ embeds: [embed] });
    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }
}
