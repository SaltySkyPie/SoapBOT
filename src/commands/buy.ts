import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import prisma from "../lib/prisma.js";
import parseAmount from "../functions/parseAmount.js";
import getUserData from "../functions/getUserData.js";
import getItemByName from "../functions/getItemByName.js";
import setPoints from "../functions/setPoints.js";
import addItem from "../functions/addItem.js";

export default class Buy extends Command {
  readonly name = "buy";
  readonly description = "Buy an item from the shop";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const itemName = interaction.options.getString("item");
    const specifiedAmount = interaction.options.getString("amount");
    const amount = specifiedAmount ? (parseAmount(specifiedAmount, 999999) ?? 1) : 1;

    if (!itemName) {
      interaction.reply({ content: `You need to specify what you actually wanna buy...` });
      return false;
    }

    const [user, item] = await Promise.all([
      getUserData(interaction.user.id),
      getItemByName(itemName),
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
      interaction.reply({ content: `You don't have enough 🧼 to purchase this item :(` });
      return false;
    }

    if (item.stock < amount && item.stock !== -1) {
      interaction.reply({
        content: `There isn't enough **${item.item_name}** in stock. (Current stock: ${item.stock})`,
      });
      return false;
    }

    if (item.stock !== -1) {
      await prisma.items.update({
        where: { id: item.id },
        data: { stock: item.stock - amount },
      });
    }

    setPoints(user!.user_id!, Number(user!.points) - Number(item.buy_cost || 0) * amount);
    addItem(user!.id, item.id, amount);

    interaction.reply({ content: `You bought ${amount.toLocaleString()}x **${item.item_name}**` });
    return true;
  }

  async getSlash() {
    const items = await prisma.items.findMany({
      where: { buyable: 1 },
      orderBy: { item_name: "asc" },
    });

    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) => {
        option.setName("item").setDescription("Item you want to buy").setRequired(true);

        for (const item of items) {
          option.addChoices({ name: item.item_name!, value: item.item_name!.toLowerCase() });
        }
        return option;
      })
      .addStringOption((option) => option.setName("amount").setDescription("Amount"));
  }
}
