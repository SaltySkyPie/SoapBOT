import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";

export default class Ping extends Command {
  readonly name = "ping";
  readonly description = "Check the bot's latency";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    interaction.reply({
      content: `Pong 🏓 Latency is ${Math.abs(Date.now() - interaction.createdTimestamp)}ms.`,
    });
    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }
}
