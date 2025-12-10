import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Item, SoapClient } from "../core/index.js";

export default class FightClubSoap extends Item {
  readonly name = "Fight Club Soap";
  readonly description = "Knock out a user, preventing them from robbing";

  // Shop properties
  readonly buyable = true;
  readonly shop = true;
  readonly buyCost = 1000;

  // Usage properties
  readonly useable = true;
  readonly activable = true;
  readonly targetable = true;
  readonly activeDuration = 300; // 5 minutes

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction, amount: number) {
    const user = interaction.member as GuildMember;
    const target = interaction.options.getMember("user") as GuildMember;

    interaction.reply({
      content: `**${user.displayName}** knocked out **${target.displayName}**. They cannot steal from any person for 5 minutes!`,
    });
    return true;
  }
}
