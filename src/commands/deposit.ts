import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import parseAmount from "../functions/parseAmount.js";
import getPoints from "../functions/getPoints.js";
import getBank from "../functions/getBank.js";
import setPoints from "../functions/setPoints.js";
import setBank from "../functions/setBank.js";

export default class Deposit extends Command {
  readonly name = "deposit";
  readonly description = "Deposit soap into your stash";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const user = interaction.member as GuildMember;
    const [[currentStashBalance, maxStashBalance], currentPoints] = await Promise.all([
      getBank(user.id),
      getPoints(user.id),
    ]);

    const enteredAmount = interaction.options.getString("amount");
    let decoded = parseAmount(enteredAmount, currentPoints);

    if (decoded === null || decoded <= 0) {
      interaction.reply({ content: `I can only slip on positive numbers...` });
      return false;
    }

    if (decoded > currentPoints) {
      interaction.reply({ content: `You don't even have that much soap...` });
      return false;
    }

    if (!currentPoints) {
      interaction.reply({
        content: `You have literally zero in your hand. Imagine being so poor lmao`,
      });
      return false;
    }

    if (currentStashBalance === maxStashBalance) {
      interaction.reply({ content: `Your stash is overflowing with foam...` });
      return false;
    }

    if (maxStashBalance - currentStashBalance < decoded) {
      decoded = maxStashBalance - currentStashBalance;
    }

    await Promise.all([
      setPoints(user.id, currentPoints - decoded),
      setBank(user.id, currentStashBalance + decoded),
    ]);

    interaction.reply({
      content: `You deposited 🧼**${decoded.toLocaleString()}** to your stash. Your current stash balance is 🧼**${(
        currentStashBalance + decoded
      ).toLocaleString()}** and hand balance 🧼**${(currentPoints - decoded).toLocaleString()}**.`,
    });

    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option
          .setName("amount")
          .setDescription("Amount of 🧼 you want to deposit")
          .setRequired(true)
      );
  }
}
