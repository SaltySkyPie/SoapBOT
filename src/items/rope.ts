import { ChatInputCommandInteraction } from "discord.js";
import { Item, SoapClient } from "../core/index.js";

export default class Rope extends Item {
  readonly name = "Rope";
  readonly description = "Protects your soap from being dropped";

  // Shop properties
  readonly buyable = true;
  readonly shop = true;
  readonly buyCost = 500;

  // Usage properties
  readonly useable = true;
  readonly activable = true;
  readonly activeDuration = 3600; // 1 hour

  async execute(_client: SoapClient, interaction: ChatInputCommandInteraction, _amount: number) {
    interaction.reply({
      content: `You used **Rope**! Next time someone tries to drop your soap they'll automatically fail.`,
    });
    return true;
  }
}
