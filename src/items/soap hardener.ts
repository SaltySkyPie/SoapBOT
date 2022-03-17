import { CommandInteraction } from "discord.js";
import SoapClient from "../types/client";
import Item from "../types/Item.js";


export default class BotItem extends Item {
    constructor(id: number, name: string, description: string) {
        super(id, name, description)
    }


    async execute(client: SoapClient, interaction: CommandInteraction)  {
        interaction.reply({content: `You used **Soap Hardener**! Next time someone tries to steal from you, they'll automatically fail.`})
        return true
    }
}