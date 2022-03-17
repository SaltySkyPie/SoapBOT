import { CommandInteraction, MessageEmbed } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from '@discordjs/builders'
import Command from "../types/Command.js";


export default class BotCommand extends Command {

    constructor(id: number, name: string, description: string) {
        super(id, name, description)
    }
    async execute(client: SoapClient, interaction: CommandInteraction) {
        const CommunityEmbed = new MessageEmbed()
        .setTitle("Join Soap BOT community server!")
        .setDescription("Giveaways, Beta testing and more!\nhttps://discord.gg/y3xMSTrUuD")
        .setThumbnail(client.user?.avatarURL() as string)
        .setColor("#ff00e4")

        interaction.reply({embeds: [CommunityEmbed]})
        return true
    }

    async getSlash(): Promise<SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">> {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}


