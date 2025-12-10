import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";

export default class Website extends Command {
  readonly name = "website";
  readonly description = "Get the Soap BOT website link";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const embed = this.createEmbed()
      .setTitle(`Soap BOT!`)
      .setDescription(`Check out Soap BOT website!\nhttps://soapbot.saltyskypie.com`)
      .setURL("https://soapbot.saltyskypie.com")
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
