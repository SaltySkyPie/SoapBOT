import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import getPoints from "../functions/getPoints.js";
import getBank from "../functions/getBank.js";

export default class Balance extends Command {
  readonly name = "balance";
  readonly description = "Check your or someone else's balance";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    let user = interaction.options.getMember("user") as GuildMember;
    if (!user) user = interaction.member as GuildMember;

    const [points, bank] = await Promise.all([getPoints(user.id), getBank(user.id)]);

    const embed = this.createEmbed()
      .setTitle(`${user.displayName}'s balance`)
      .setDescription(
        `Hand: 🧼**${points.toLocaleString()}**\nStash: 🧼**${bank[0].toLocaleString()}** / 🧼**${bank[1].toLocaleString()}**`
      );

    interaction.reply({ embeds: [embed] });
    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) => option.setName("user").setDescription("User").setRequired(false));
  }
}
