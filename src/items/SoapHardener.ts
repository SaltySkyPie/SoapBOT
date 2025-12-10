import { ChatInputCommandInteraction } from "discord.js";
import { Item, SoapClient } from "../core/index.js";

export default class SoapHardener extends Item {
  readonly name = "Soap Hardener";
  readonly description = "Protects your soap from being stolen";

  // Shop properties
  readonly buyable = true;
  readonly shop = true;
  readonly buyCost = 750;

  // Usage properties
  readonly useable = true;
  readonly activable = true;
  readonly activeDuration = 3600; // 1 hour

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction, amount: number) {
    interaction.reply({
      content: `You used **Soap Hardener**! Next time someone tries to steal from you, they'll automatically fail.`,
    });
    return true;
  }
}
