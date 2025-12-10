import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import getPoints from "../functions/getPoints.js";
import setPoints from "../functions/setPoints.js";

const DAILY_REWARD = 10000;

export default class Daily extends Command {
  readonly name = "daily";
  readonly description = "Claim your daily soap reward";
  readonly cooldown = 86400; // 24 hours

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    await setPoints(interaction.user.id, (await getPoints(interaction.user.id)) + DAILY_REWARD);

    const embed = this.createEmbed()
      .setTitle(`Take your daily soapy reward!`)
      .setDescription(
        `You recieved 🧼**${DAILY_REWARD.toLocaleString()}**\nMake sure to check out https://soapbot.saltyskypie.com and vote for Soap BOT for some additional goodies!`
      );

    interaction.reply({ embeds: [embed] });
    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
  }
}
