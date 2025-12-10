import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, SoapClient } from "../core/index.js";
import prisma from "../lib/prisma.js";
import getServerCount from "../functions/getServerCount.js";
import { formatDuration } from "../utils/time.js";

export default class Stats extends Command {
  readonly name = "stats";
  readonly description = "View Soap BOT statistics";

  async execute(client: SoapClient, interaction: ChatInputCommandInteraction) {
    const [guilds, walletAgg, bankAgg, maxBankAgg, usersCount, itemsCount, commandsCount] =
      await Promise.all([
        getServerCount(client).catch(() => "loading..."),
        prisma.users.aggregate({ _sum: { points: true } }),
        prisma.users.aggregate({ _sum: { stash: true } }),
        prisma.users.aggregate({ _sum: { max_stash: true } }),
        prisma.users.count(),
        prisma.items.count(),
        prisma.commands.count(),
      ]);

    const economyWallet = Number(walletAgg._sum.points || 0);
    const economyBank = Number(bankAgg._sum.stash || 0);
    const economyMaxBank = Number(maxBankAgg._sum.max_stash || 0);

    const uptimeMs = client.readyAt ? Date.now() - client.readyAt.getTime() : 0;
    const uptime = formatDuration(uptimeMs);

    const embed = this.createEmbed()
      .setAuthor({
        name: "Soap BOT stats",
        iconURL: "https://cdn.saltyskypie.com/soapbot/images/soap.png",
      })
      .addFields([
        { name: `\u200B`, value: `**Servers**: ${guilds}` },
        { name: `\u200B`, value: `**Users**: ${usersCount.toLocaleString()}` },
        { name: `\u200B`, value: `**Commands**: ${commandsCount.toLocaleString()}` },
        { name: `\u200B`, value: `**Items**: ${itemsCount.toLocaleString()}` },
        { name: `\u200B`, value: `**Total soap in hands**: 🧼${economyWallet.toLocaleString()}` },
        { name: `\u200B`, value: `**Total soap in stashes**: 🧼${economyBank.toLocaleString()}` },
        {
          name: `\u200B`,
          value: `**Total soap that can be stored in stash**: 🧼${economyMaxBank.toLocaleString()}`,
        },
        {
          name: `\u200B`,
          value: `**Total soap in hands and stashes combined**: 🧼${(economyWallet + economyBank).toLocaleString()}`,
        },
        { name: `\u200B`, value: `**Uptime**: ${uptime}` },
        { name: `\u200B`, value: `**Shard**: #${interaction.guild?.shardId}` },
      ]);

    interaction.reply({ embeds: [embed] });
    return true;
  }

  async getSlash() {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
  }
}
