import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import getSoapStatus from "../functions/getSoapStatus.js";
import checkActiveItem from "../functions/checkActiveItem.js";
import removeActiveItem from "../functions/removeActiveItem.js";
import setPoints from "../functions/setPoints.js";
import getUserData from "../functions/getUserData.js";
import dmUser from "../functions/dmUser.js";

const ROB_MIN_THRESHOLD = 1000;
const ROB_FAIL_HARDENER_LOSS = 500;
const ROB_FAIL_LOSS_PERCENT = 0.1; // 10%

export default class Rob extends Command {
  readonly name = "rob";
  readonly description = "Try to rob another user";
  readonly cooldown = 120; // 2 minutes

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const user = interaction.member as GuildMember;
    const mention = interaction.options.getMember("user") as GuildMember;

    if (!mention) {
      interaction.reply({ content: "BRUH... Are you dumb? Try again with an actual person." });
      return false;
    }

    if (user.id === mention.id) {
      interaction.reply({ content: "Get lost!" });
      return false;
    }

    if ((await getSoapStatus(user.id)) !== 0) {
      interaction.reply({ content: `You need to pick up your soap first :smirk:` });
      return false;
    }

    const [victim, robber] = await Promise.all([getUserData(mention.id), getUserData(user.id)]);

    if (!victim) {
      interaction.reply({
        content: `**${mention.displayName}** doen't even have 🧼**${ROB_MIN_THRESHOLD.toLocaleString()}**. Not worth`,
      });
      return false;
    }

    if (victim.points! < ROB_MIN_THRESHOLD) {
      interaction.reply({
        content: `**${mention.displayName}** doen't even have 🧼**${ROB_MIN_THRESHOLD.toLocaleString()}**. Not worth`,
      });
      return false;
    }

    if (robber!.points! < ROB_MIN_THRESHOLD) {
      interaction.reply({
        content: `You need atleast 🧼**${ROB_MIN_THRESHOLD.toLocaleString()}** to rob someone. Imagine being so poor lmao`,
      });
      return false;
    }

    const fcsCheck = await checkActiveItem(robber!.id, 18);
    if (fcsCheck) {
      interaction.reply({
        content: `You were knocked out. You need to get back on your feet first lmao`,
      });
      return true;
    }

    const hardenerCheck = await checkActiveItem(victim.id, 2);

    if (hardenerCheck) {
      await removeActiveItem(victim.id, 2);

      const failDm = this.createEmbed()
        .setTitle(
          `${user.displayName} (${user.user.username}#${user.user.discriminator}) tried to steal from you in ${interaction.guild?.name} but failed due to you having Soap Hardener equipped!`
        )
        .setDescription(`<#${interaction.channelId}>`);

      interaction.reply({
        content: `You tried to steal from **${mention.displayName}** but when you tried to lift their soap, you realized it's 69x heavier. You ended up losing **🧼${ROB_FAIL_HARDENER_LOSS}**.`,
      });
      await dmUser(mention, { embeds: [failDm] });
      await Promise.all([
        setPoints(mention.id, Number(victim.points) + ROB_FAIL_HARDENER_LOSS),
        setPoints(user.id, Number(robber!.points) - ROB_FAIL_HARDENER_LOSS),
      ]);

      return true;
    }

    const success = Math.round(Math.random());

    if (success) {
      const percent = Math.round(Math.random() * 100 + 1) / 100;
      const successDm = this.createEmbed()
        .setTitle(
          `${user.displayName} (${user.user.username}#${user.user.discriminator}) stole from you in ${interaction.guild?.name}!`
        )
        .setDescription(`<#${interaction.channelId}>`);
      await dmUser(mention, { embeds: [successDm] });

      const stolenAmount = Math.round(percent * Number(victim.points));
      await Promise.all([
        setPoints(mention.id, Number(victim.points) - stolenAmount),
        setPoints(user.id, Number(robber!.points) + stolenAmount),
      ]);

      interaction.reply({
        content: `You stole 🧼**${stolenAmount.toLocaleString()}** from **${mention.displayName}**! (${Math.round(percent * 100)}% of their total 🧼).`,
      });
    } else {
      const failDm = this.createEmbed()
        .setTitle(
          `${user.displayName} (${user.user.username}#${user.user.discriminator}) tried to steal from you in ${interaction.guild?.name} but failed!`
        )
        .setDescription(`<#${interaction.channelId}>`);
      await dmUser(mention, { embeds: [failDm] });

      const lostAmount = Math.round(ROB_FAIL_LOSS_PERCENT * Number(robber!.points));
      await Promise.all([
        setPoints(mention.id, Number(victim.points) + lostAmount),
        setPoints(user.id, Number(robber!.points) - lostAmount),
      ]);

      interaction.reply({
        content: `You tried to steal from **${mention.displayName}** but **slipped** on your soap and paid 🧼**${lostAmount.toLocaleString()}**`,
      });
    }

    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) =>
        option.setName("user").setDescription("Select a user").setRequired(true)
      );
  }
}
