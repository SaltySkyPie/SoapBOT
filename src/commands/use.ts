import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient, Item } from "../core/index.js";
import prisma from "../lib/prisma.js";
import getUserData from "../functions/getUserData.js";
import getItemByName from "../functions/getItemByName.js";
import addActiveItem from "../functions/addActiveItem.js";
import setItemAmount from "../functions/setItemAmount.js";
import parseAmount from "../functions/parseAmount.js";

export default class Use extends Command {
  readonly name = "use";
  readonly description = "Use an item from your inventory";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const [user, item] = await Promise.all([
      getUserData(interaction.user.id),
      getItemByName(interaction.options.getString("item")!),
    ]);

    let amount = 1;

    if (!user || !item) {
      interaction.reply({ content: `This item doesn't even exist lol` });
      return false;
    }

    if (!item.useable) {
      interaction.reply({ content: `This item isnt even usable lol` });
      return false;
    }

    const itemOwnership = await prisma.inventory.findFirst({
      where: {
        item_id: item.id,
        user_id: user.id,
        amount: { gt: 0 },
      },
    });

    if (!itemOwnership) {
      interaction.reply({ content: `You don't even have any ${item.item_name!} lol...` });
      return false;
    }

    const ownedAmount = itemOwnership.amount!;

    if (item.multiple_usable) {
      const specifiedAmount = interaction.options.getString("amount");
      amount = specifiedAmount ? (parseAmount(specifiedAmount, ownedAmount) ?? 1) : 1;
    }

    if (ownedAmount < amount) {
      interaction.reply({ content: `You don't even have that much of ${item.item_name!} lol...` });
      return false;
    }

    if (item.targetable) {
      const target = await getUserData(
        interaction.options.getUser("user")?.id
          ? interaction.options.getUser("user")!.id
          : "0"
      );

      if (!target) {
        interaction.reply({ content: "You need to select a person..." });
        return false;
      }

      const check = await addActiveItem(target.id, item.id, Number(item.active_duration));

      if (!check) {
        interaction.reply({ content: `This item is already active...` });
        return false;
      }

      const i: Item = client.items.get(item.item_name!.toLowerCase())!;

      if (!i) {
        interaction.reply({ content: `This item isn't even useable lol` });
        return false;
      }

      if (await i.execute(client, interaction, amount)) {
        await setItemAmount(user.id, item.id, ownedAmount - amount);
      }
      return true;
    }

    if (item.activable) {
      const check = await addActiveItem(user.id, item.id, Number(item.active_duration));

      if (!check) {
        interaction.reply({ content: `This item is already active...` });
        return false;
      }

      const i: Item = client.items.get(item.item_name!.toLowerCase())!;

      if (!i) {
        interaction.reply({ content: `This item isn't even usable lol` });
        return false;
      }

      if (await i.execute(client, interaction, amount)) {
        await setItemAmount(user.id, item.id, ownedAmount - amount);
      }
      return true;
    }

    if (item.useable) {
      const i: Item = client.items.get(item.item_name!.toLowerCase())!;

      if (!i) {
        interaction.reply({ content: `This item isn't even usable lol` });
        return false;
      }

      if (await i.execute(client, interaction, amount)) {
        await setItemAmount(user.id, item.id, ownedAmount - amount);
      }
      return true;
    }

    interaction.reply({ content: `This item isn't even usable lol` });
    return false;
  }

  async getSlash() {
    const items = await prisma.items.findMany({
      where: { useable: 1 },
      orderBy: { item_name: "asc" },
    });

    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) => {
        option
          .setName("item")
          .setDescription("Item you want to use")
          .setRequired(true);

        for (const item of items) {
          option.addChoices({ name: item.item_name!, value: item.item_name!.toLowerCase() });
        }
        return option;
      })
      .addStringOption((option) =>
        option
          .setName("amount")
          .setDescription("Amount of the selected item you want to use at the same time.")
      )
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Select a user if item is targetable")
      );
  }
}
