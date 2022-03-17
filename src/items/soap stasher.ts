import { CommandInteraction, GuildMember } from "discord.js";
import decodeNumber from "../functions/decodeNumber.js";
import getBank from "../functions/getBank.js";
import SQL from "../functions/SQL.js";
import SoapClient from "../types/client";
import Item from "../types/Item.js";


export default class BotItem extends Item {
    constructor(id: number, name: string, description: string) {
        super(id, name, description)
    }


    async execute(client: SoapClient, interaction: CommandInteraction) {

        const user = interaction.user
        const specified_amount = interaction.options.getString('amount')
        const amount = specified_amount ? await decodeNumber(specified_amount) : 1

        const bank = await getBank(user.id); // 0 = current, 1 = max
        await SQL("UPDATE users SET max_stash=? WHERE user_id=?", [bank[1] + (2500 * amount), user.id])
        interaction.reply({ content: `You used ${amount.toLocaleString()}x **Soap stasher** and expanded your stash capacity by **🧼${(2500 * amount).toLocaleString()}**!` });


        return true
    }
}