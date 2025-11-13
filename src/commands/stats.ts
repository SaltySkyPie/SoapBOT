import { CommandInteraction, EmbedBuilder } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../types/Command.js";
import SQL from "../functions/SQL.js";
import getServerCount from "../functions/getServerCount.js";
import getTimeRemaining from "../functions/getTimeRemaining.js";

export default class BotCommand extends Command {
  constructor(id: number, name: string, description: string) {
    super(id, name, description);
  }
  async execute(client: SoapClient, interaction: CommandInteraction) {
    const [
      guilds,
      economy_wallet,
      economy_bank,
      economy_max_bank,
      users,
      items,
      commands,
    ] = await Promise.all([
      getServerCount(client).catch(() => {
        return "loading...";
      }),
      SQL("SELECT SUM(points) AS sumpoints FROM users"),
      SQL("SELECT SUM(stash) AS sumpoints FROM users"),
      SQL("SELECT SUM(max_stash) AS sumpoints FROM users"),
      SQL("SELECT COUNT(id) AS countusers FROM users"),
      SQL("SELECT COUNT(id) AS countitems FROM items"),
      SQL("SELECT COUNT(id) AS countcommands FROM commands"),
    ]);
    //interaction.reply(`🧼**Soap BOT** is in **${guilds}** servers with **${users[0].countusers.toLocaleString()}** users. Total soap in hands: **🧼${economy_wallet[0].sumpoints.toLocaleString()}**. Total soap in stashes: **🧼${economy_bank[0].sumpoints.toLocaleString()}**. Total soap in hands and stashes combined: 🧼**${(economy_wallet[0].sumpoints + economy_bank[0].sumpoints).toLocaleString()}**. Total soap that can be stored in stash: **🧼${economy_max_bank[0].sumpoints.toLocaleString()}**. This server is running on **Shard ${interaction.guild?.shardId}**`);
    const remaining = getTimeRemaining(
      `${client.readyAt?.toISOString()}`,
      `${new Date(Date.now()).toISOString()}`
    );
    const d = remaining.days ? `${remaining.days}d ` : "";
    const h = remaining.hours ? `${remaining.hours}h ` : "";
    const m = remaining.minutes ? `${remaining.minutes}m ` : "";
    const s = remaining.seconds ? `${remaining.seconds}s ` : "0s";
    const uptime = `${d + h + m + s}`;

    const StatsEmbed = new EmbedBuilder()
      .setColor("#ff00e4")
      .setAuthor({
        name: "Soap BOT stats",
        iconURL: "https://cdn.saltyskypie.com/soapbot/images/soap.png",
      })
      .addFields([
        { name: `\u200B`, value: `**Servers**: ${guilds}` },
        {
          name: `\u200B`,
          value: `**Users**: ${users[0].countusers.toLocaleString()}`,
        },
        {
          name: `\u200B`,
          value: `**Commands**: ${commands[0].countcommands.toLocaleString()}`,
        },
        {
          name: `\u200B`,
          value: `**Items**: ${items[0].countitems.toLocaleString()}`,
        },
        {
          name: `\u200B`,
          value: `**Total soap in hands**: 🧼${economy_wallet[0].sumpoints.toLocaleString()}`,
        },
        {
          name: `\u200B`,
          value: `**Total soap in stashes**: 🧼${economy_bank[0].sumpoints.toLocaleString()}`,
        },
        {
          name: `\u200B`,
          value: `**Total soap that can be stored in stash**: 🧼${economy_max_bank[0].sumpoints.toLocaleString()}`,
        },
        {
          name: `\u200B`,
          value: `**Total soap in hands and stashes combined**: 🧼${(
            economy_wallet[0].sumpoints + economy_bank[0].sumpoints
          ).toLocaleString()}`,
        },
        { name: `\u200B`, value: `**Uptime**: ${uptime}` },
        { name: `\u200B`, value: `**Shard**: #${interaction.guild?.shardId}` },
      ]);

    interaction.reply({ embeds: [StatsEmbed] });
    return true;
  }

  async getSlash(): Promise<
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
  > {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }
}
