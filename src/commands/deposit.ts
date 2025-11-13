import { CommandInteraction,
  ChatInputCommandInteraction, GuildMember } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import decodeNumber from "../functions/decodeNumber.js";
import getPoints from "../functions/getPoints.js";
import getBank from "../functions/getBank.js";
import setPoints from "../functions/setPoints.js";
import setBank from "../functions/setBank.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const user = interaction.member as GuildMember;
    const [[current_stash_balance, max_stash_balance], current_points] =
      await Promise.all([getBank(user.id), getPoints(user.id)]);

    const entered_amount = interaction.options.getString("amount");

    let decoded =
      entered_amount == "max" || entered_amount == "all"
        ? current_points
        : await decodeNumber(entered_amount!);

    if (!decoded) {
      interaction.reply({ content: `I can only slip on numbers...` });
      return false;
    }

    if (decoded > current_points) {
      interaction.reply({ content: `You don't even have that much soap...` });
      return false;
    }

     if (decoded < 0) {
       interaction.reply({ content: `I can only slip on positive numbers...` });
       return false;
     }

    if (!current_points) {
      interaction.reply({
        content: `You have literally zero in your hand. Imagine being so poor lmao`,
      });
      return false;
    }

    if (current_stash_balance == max_stash_balance) {
      interaction.reply({ content: `Your stash is overflowing with foam...` });
      return false;
    }

    if (max_stash_balance - current_stash_balance < decoded) {
      decoded = max_stash_balance - current_stash_balance;
    }

    await Promise.all([
      setPoints(user.id, current_points - decoded),
      setBank(user.id, current_stash_balance + decoded),
    ]);

    interaction.reply({
      content: `You deposited 🧼**${decoded.toLocaleString()}** to your stash. Your current stash balance is 🧼**${(
        current_stash_balance + decoded
      ).toLocaleString()}** and hand balance 🧼**${(
        current_points - decoded
      ).toLocaleString()}**.`,
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
