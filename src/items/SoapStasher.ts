import { ChatInputCommandInteraction } from "discord.js";
import { Item, SoapClient } from "../core/index.js";
import getBank from "../functions/getBank.js";
import prisma from "../lib/prisma.js";

export default class SoapStasher extends Item {
  readonly name = "Soap Stasher";
  readonly description = "Expand your stash capacity by 2,500";

  // Shop properties
  readonly buyable = true;
  readonly shop = true;
  readonly buyCost = 5000;

  // Usage properties
  readonly useable = true;
  readonly multipleUsable = true;

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction, amount: number) {
    const user = interaction.user;
    const bank = await getBank(user.id);

    await prisma.user.update({
      where: { user_id: user.id },
      data: { max_stash: bank[1] + 2500 * amount },
    });

    interaction.reply({
      content: `You used ${amount.toLocaleString()}x **Soap stasher** and expanded your stash capacity by **🧼${(2500 * amount).toLocaleString()}**!`,
    });

    return true;
  }
}
