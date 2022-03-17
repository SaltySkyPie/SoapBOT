import { CommandInteraction } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from '@discordjs/builders'
import Command from "../types/Command.js";


export default class BotCommand extends Command {

    constructor(id: number, name: string, description: string) {
        super(id, name, description)
    }
    async execute(client: SoapClient, interaction: CommandInteraction) {
        interaction.reply({ content: `Pong 🏓 Latency is ${Math.abs(Date.now() - interaction.createdTimestamp)}ms.`})
        return true
    }

    async getSlash(): Promise<SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">> {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}


