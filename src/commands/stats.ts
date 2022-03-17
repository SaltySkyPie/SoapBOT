import { CommandInteraction, MessageEmbed } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from '@discordjs/builders'
import Command from "../types/Command.js";
import SQL from "../functions/SQL.js";
import getServerCount from "../functions/getServerCount.js";


export default class BotCommand extends Command {

    constructor(id: number, name: string, description: string) {
        super(id, name, description)
    }
    async execute(client: SoapClient, interaction: CommandInteraction) {
        
        const [guilds, economy_wallet, economy_bank, economy_max_bank, users] = await Promise.all([
            getServerCount(client).catch(() => { return "loading..." }),
            SQL("SELECT SUM(points) AS sumpoints FROM users"),
            SQL("SELECT SUM(stash) AS sumpoints FROM users"),
            SQL("SELECT SUM(max_stash) AS sumpoints FROM users"),
            SQL("SELECT COUNT(id) AS countusers FROM users")
        ])
        interaction.reply(`🧼**Soap BOT** is in **${guilds}** servers with **${users[0].countusers.toLocaleString()}** users. Total soap in hands: **🧼${economy_wallet[0].sumpoints.toLocaleString()}**. Total soap in stashes: **🧼${economy_bank[0].sumpoints.toLocaleString()}**. Total soap in hands and stashes combined: 🧼**${(economy_wallet[0].sumpoints + economy_bank[0].sumpoints).toLocaleString()}**. Total soap that can be stored in stash: **🧼${economy_max_bank[0].sumpoints.toLocaleString()}**. This server is running on **Shard ${interaction.guild?.shardId}**`);
    
        return true
    }

    async getSlash(): Promise<SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">> {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}


