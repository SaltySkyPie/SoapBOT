import { CommandInteraction, MessageEmbed } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    const WebsiteEmbed = new MessageEmbed()
      .setTitle(`Soap BOT!`)
      .setDescription(`Check out Soap BOT website!\nhttps://soapbot.net`)
      .setColor("#ff00e4")
      .setURL("https://soapbot.net")
      .setThumbnail(client.user?.avatarURL() as string);

    interaction.reply({ embeds: [WebsiteEmbed] });
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
