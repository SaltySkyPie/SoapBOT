import { CommandInteraction, ChatInputCommandInteraction, GuildMember } from "discord.js";
import SoapClient from "../types/client";
import Item from "../types/Item.js";

export default class BotItem extends Item {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    interaction.reply({
      content: `**${
        (interaction.member as GuildMember).displayName
      }** knocked out **${
        (interaction.options.getMember("user") as GuildMember).displayName
      }**. They cannot steal from any person for 5 minutes!`,
    });
    return true;
  }
}
