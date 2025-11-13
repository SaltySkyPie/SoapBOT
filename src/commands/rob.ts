import { CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import getSoapstatus from "../functions/getSoapStatus.js";
import checkActiveItem from "../functions/checkActiveItem.js";
import removeActiveItem from "../functions/removeActiveItem.js";
import getBaseValue from "../functions/getBaseValue.js";
import setPoints from "../functions/setPoints.js";
import getUserData from "../functions/getUserData.js";
import dmUser from "../functions/dmUser.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    const user = interaction.member as GuildMember;
    const mention = interaction.options.getMember("user") as GuildMember;

    if (!mention) {
      interaction.reply({
        content: "BRUH... Are you dumb? Try again with an actual person.",
      });
      return false;
    }

    if (user.id === mention.id) {
      interaction.reply({ content: "Get lost!" });
      return false;
    }

    if ((await getSoapstatus(user.id)) != 0) {
      interaction.reply({
        content: `You need to pick up your soap first :smirk:`,
      });
      return false;
    }

    const [victim, robber] = await Promise.all([
      getUserData(mention.id),
      getUserData(user.id),
    ]);

    const min_threshhold = parseInt(await getBaseValue("rob_min_threshhold"));

    if (!victim) {
      interaction.reply({
        content: `**${
          mention.displayName
        }** doen't even have 🧼**${min_threshhold.toLocaleString()}**. Not worth`,
      });
      return false;
    }
    if (victim.points < min_threshhold) {
      interaction.reply({
        content: `**${
          mention.displayName
        }** doen't even have 🧼**${min_threshhold.toLocaleString()}**. Not worth`,
      });
      return false;
    }
    if (robber.points < min_threshhold) {
      interaction.reply({
        content: `You need atleast 🧼**${min_threshhold.toLocaleString()}** to rob someone. Imagine being so poor lmao`,
      });
      return false;
    }

    const FCSCheck = await checkActiveItem(robber.id, 18);
    if (FCSCheck) {
      interaction.reply({
        content: `You were knocked out. You need to get back on your feet first lmao`,
      });
      return true;
    }

    const hardenerCheck = await checkActiveItem(victim.id, 2);

    if (hardenerCheck) {
      await removeActiveItem(victim.id, 2);

      const failDm = new EmbedBuilder()
        .setTitle(
          `${user.displayName} (${user.user.username}#${user.user.discriminator}) tried to steal from you in ${interaction.guild?.name} but failed due to you having Soap Hardener equipped!`
        )
        .setColor("#ff00e4")
        .setDescription(`<#${interaction.channelId}>`);

      const lose = parseInt(await getBaseValue("rob_fail_hardener"));

      interaction.reply({
        content: `You tried to steal from **${mention.displayName}** but when you tried to lift their soap, you realized it's 69x heavier. You ended up losing **🧼${lose}**.`,
      });
      await dmUser(mention, { embeds: [failDm] });
      await Promise.all([
        setPoints(mention.id, victim.points + lose),
        setPoints(user.id, robber.points - lose),
      ]);

      return true;
    }

    const success = Math.round(Math.random());

    if (success) {
      const percent = Math.round(Math.random() * 100 + 1) / 100;
      const successDm = new EmbedBuilder()
        .setTitle(
          `${user.displayName} (${user.user.username}#${user.user.discriminator}) stole from you in ${interaction.guild?.name}!`
        )
        .setColor("#ff00e4")
        .setDescription(`<#${interaction.channelId}>`);
      await dmUser(mention, { embeds: [successDm] });

      const stolenAmount = Math.round(percent * victim.points);
      await Promise.all([
        setPoints(mention.id, victim.points - stolenAmount),
        setPoints(user.id, robber.points + stolenAmount),
      ]);
      interaction.reply({
        content: `You stole 🧼**${stolenAmount.toLocaleString()}** from **${
          mention.displayName
        }**! (${Math.round(percent * 100)}% of their total 🧼).`,
      });
    } else {
      const loss_percentage = parseFloat(await getBaseValue("rob_fail_loss"));

      const failDm = new EmbedBuilder()
        .setTitle(
          `${user.displayName} (${user.user.username}#${user.user.discriminator}) tried to steal from you in ${interaction.guild?.name} but failed!`
        )
        .setColor("#ff00e4")
        .setDescription(`<#${interaction.channelId}>`);
      await dmUser(mention, { embeds: [failDm] });

      const lostAmount = Math.round(loss_percentage * robber.points);
      await Promise.all([
        setPoints(mention.id, victim.points + lostAmount),
        setPoints(user.id, robber.points - lostAmount),
      ]);

      interaction.reply({
        content: `You tried to steal from **${
          mention.displayName
        }** but **slipped** on your soap and paid 🧼**${lostAmount.toLocaleString()}**`,
      });
    }

    return true;
  }

  async getSlash(): Promise<
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
  > {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) =>
        option.setName("user").setDescription("Select a user").setRequired(true)
      );
  }
}
