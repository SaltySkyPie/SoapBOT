import { CommandInteraction, ChatInputCommandInteraction } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import SQL from "../functions/SQL.js";
import decodeNumber from "../functions/decodeNumber.js";
import getUserData from "../functions/getUserData.js";
import getItemByName from "../functions/getItemByName.js";
import setPoints from "../functions/setPoints.js";
import addItem from "../functions/addItem.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const item_name = interaction.options.getString("item");
    const specified_amount = interaction.options.getString("amount");
    const amount = specified_amount ? await decodeNumber(specified_amount) : 1;

    if (!item_name) {
      interaction.reply({
        content: `You need to specify what you actually wanna buy...`,
      });
      return false;
    }

    const [user, item] = await Promise.all([
      getUserData(interaction.user.id),
      getItemByName(item_name),
    ]);

    if (!item) {
      interaction.reply({ content: `This item doesnt even exist lmao` });
      return false;
    }

    if (!item.stock || !item.buyable || !item.shop) {
      interaction.reply({ content: `This item isn't even in the shop...` });
      return false;
    }

    if (user!.points < (item.buy_cost || 0) * amount) {
      interaction.reply({
        content: `You don't have enough 🧼 to purchase this item :(`,
      });
      return false;
    }

    if (item.stock < amount && item.stock != -1) {
      interaction.reply({
        content: `There isn't enough **${item.item_name}** in stock. (Current stock: ${item.stock})`,
      });
      return false;
    }

    if (item.stock != -1) {
      SQL("UPDATE items SET stock=? WHERE id=?", [
        item.stock - amount,
        item.id,
      ]);
    }

    setPoints(user!.user_id!, Number(user!.points) - Number(item.buy_cost || 0) * amount);
    addItem(user!.id, item.id, amount);

    interaction.reply({
      content: `You bought ${amount.toLocaleString()}x **${item.item_name}**`,
    });

    return true;
  }

  async getSlash() {
    const items = await SQL(
      "SELECT * FROM items WHERE buyable=1 ORDER BY item_name"
    );

    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) => {
        option
          .setName("item")
          .setDescription("Item you want to buy")
          .setRequired(true);

        for (const item of items) {
          option.addChoices({ name: item.item_name, value: item.item_name.toLowerCase() });
        }

        return option;
      })
      .addStringOption((option) =>
        option.setName("amount").setDescription("Amount")
      );
  }
}
