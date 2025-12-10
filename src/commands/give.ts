import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import getSoapStatus from "../functions/getSoapStatus.js";
import setPoints from "../functions/setPoints.js";
import getUserData from "../functions/getUserData.js";
import getPoints from "../functions/getPoints.js";
import parseAmount from "../functions/parseAmount.js";

const GIVE_TAX = 0.1; // 10%

export default class Give extends Command {
  readonly name = "give";
  readonly description = "Give soap to another user";
  readonly cooldown = 60; // 1 minute

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const user = interaction.member as GuildMember;
    const mention = interaction.options.getMember("user") as GuildMember;

    const amountInput = interaction.options.getString("amount");
    const points = await getPoints(interaction.user.id);
    const amount = parseAmount(amountInput, points);

    if (amount === null || amount < 100) {
      interaction.reply({ content: `You need to give atleast 🧼**100**` });
      return false;
    }

    if (amount > points) {
      interaction.reply({ content: `You don't have enough 🧼 to give :(` });
      return false;
    }

    if (!mention) {
      interaction.reply({ content: "BRUH... Are you dumb? Try again with an actual person." });
      return false;
    }

    if (user.id === mention.id) {
      interaction.reply({ content: "Get lost!" });
      return false;
    }

    if ((await getSoapStatus(user.id)) != 0) {
      interaction.reply({ content: `You need to pick up your soap first :smirk:` });
      return false;
    }

    const [target, origin] = await Promise.all([
      getUserData(mention.id),
      getUserData(user.id),
    ]);

    await Promise.all([
      setPoints(origin!.user_id!, Number(origin!.points) - amount),
      setPoints(target!.user_id!, Number(target!.points) + (amount - amount * GIVE_TAX)),
    ]);

    interaction.reply({
      content: `You gave 🧼**${amount.toLocaleString()}** to **${mention.displayName}**. After ${GIVE_TAX * 100}% tax they now have 🧼**${
        Number(target!.points) + (amount - amount * GIVE_TAX)
      }** and you have 🧼**${Number(origin!.points) - amount}**.`,
    });

    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) =>
        option.setName("user").setDescription("Select a user").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("amount").setDescription("Amount to give").setRequired(true)
      );
  }
}
