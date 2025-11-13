import { CommandInteraction, EmbedBuilder } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    const WebsiteEmbed = new EmbedBuilder()
      .setTitle(`Soap BOT!`)
      .setDescription(`Check out Soap BOT website!\nhttps://soapbot.saltyskypie.com`)
      .setColor("#ff00e4")
      .setURL("https://soapbot.saltyskypie.com")
      .setThumbnail(client.user?.avatarURL() as string);

    interaction.reply({ embeds: [WebsiteEmbed] });
    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }
}
