import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import prisma from "../lib/prisma.js";

export default class Kill extends Command {
  readonly name = "kill";
  readonly description = "Kill another user (for fun)";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("user") as GuildMember;
    const user = interaction.member as GuildMember;

    if (!target) {
      interaction.reply({ content: "You actually need a target to kill... thats a common sense tbh" });
      return false;
    }

    if (interaction.user.id === target.id) {
      interaction.reply({ content: "You can't kill yourself dummy..." });
      return false;
    }

    const killMessages = await prisma.killMessage.findMany();
    const randomKill = killMessages[Math.floor(Math.random() * killMessages.length)];
    const kill = randomKill.message
      .toString()
      .replaceAll("{1}", `**${user.displayName}**`)
      .replaceAll("{0}", `**${target.displayName}**`);

    const embed = this.createEmbed()
      .setTitle(":knife: Kill summary :knife:")
      .setDescription(kill);

    interaction.reply({ embeds: [embed] });
    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) =>
        option.setName("user").setDescription("Victim").setRequired(true)
      );
  }
}
