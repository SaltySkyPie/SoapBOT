import { CommandInteraction,
  ChatInputCommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import getSoapstatus from "../functions/getSoapStatus.js";
import getBaseValue from "../functions/getBaseValue.js";
import setPoints from "../functions/setPoints.js";
import getUserData from "../functions/getUserData.js";
import getPoints from "../functions/getPoints.js";
import decodeNumber from "../functions/decodeNumber.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const user = interaction.member as GuildMember;
    const mention = interaction.options.getMember("user") as GuildMember;

    const amountInput = interaction.options.getString("amount");
    const points = await getPoints(interaction.user.id);
    const amount =
      amountInput == "max" || amountInput == "all"
        ? points
        : await decodeNumber(amountInput!);

    if (amount < 100) {
      interaction.reply({
        content: `You need to give atleast 🧼**100**`,
      });
      return false;
    }
    if (amount > points) {
      interaction.reply({
        content: `You don't have enough 🧼 to give :(`,
      });
      return false;
    }

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

    const [target, origin] = await Promise.all([
      getUserData(mention.id),
      getUserData(user.id),
    ]);

    const tax = parseFloat((await getBaseValue("give_tax"))!);
    console.log("tax", tax);

    await Promise.all([
      setPoints(origin!.user_id!, Number(origin!.points) - amount),
      setPoints(target!.user_id!, Number(target!.points) + (amount - amount * tax)),
    ]);

    interaction.reply({
      content: `You gave 🧼**${amount.toLocaleString()}** to **${
        mention.displayName
      }**. After ${tax * 100}% tax they now have 🧼**${
        Number(target!.points) + (amount - amount * tax)
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
        option
          .setName("amount")
          .setDescription("Amount to give")
          .setRequired(true)
      );
  }
}
