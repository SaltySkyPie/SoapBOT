import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";

export default class Vote extends Command {
  readonly name = "vote";
  readonly description = "Vote for Soap BOT to earn rewards";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const embed = this.createEmbed()
      .setTitle("Upvote Soap BOT!")
      .setDescription(
        "You can upvote Soap BOT to get some additional soap and items.\nhttps://discordbotlist.com/bots/soap-bot/upvote\nhttps://top.gg/bot/908817514480406628/vote"
      )
      .setThumbnail(client.user?.avatarURL() as string)
      .setURL("https://soapbot.saltyskypie.com/vote");

    interaction.reply({ embeds: [embed] });
    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
  }
}
