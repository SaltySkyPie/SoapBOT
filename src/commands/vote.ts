import { CommandInteraction, MessageEmbed } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    const VoteEmbed = new MessageEmbed()
      .setTitle("Upvote Soap BOT!")
      .setDescription(
        "You can upvote Soap BOT to get some additional soap and items.\nhttps://discordbotlist.com/bots/soap-bot/upvote\nhttps://top.gg/bot/908817514480406628/vote"
      )
      .setThumbnail(client.user?.avatarURL() as string)
      .setColor("#ff00e4")
      .setURL("https://soapbot.saltyskypie.com/vote");

    interaction.reply({ embeds: [VoteEmbed] });
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
