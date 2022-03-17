import { CommandInteraction } from "discord.js";
import SoapClient from "../types/client";
import { SlashCommandBuilder } from '@discordjs/builders'
import Command from "../types/Command.js";
import SQL from "../functions/SQL.js";
import getUserData from "../functions/getUserData.js";
import getItemByName from "../functions/getItemByName.js";
import addAdctiveItem from "../functions/addActiveItem.js";
import BotItem from "../items/rope";
import setItemAmount from "../functions/setItemAmount.js";
import decodeNumber from "../functions/decodeNumber.js";


export default class BotCommand extends Command {

    constructor(id: number, name: string, description: string) {
        super(id, name, description)
    }
    async execute(client: SoapClient, interaction: CommandInteraction) {

        // get user + item data

        const [user, item] = await Promise.all([getUserData(interaction.user.id), getItemByName(interaction.options.getString('item')!)])
        // check item data + item ownership

        let amount = 1

        if (!user || !item) {
            interaction.reply({ content: `This item doesn't even exist lol` })
            return false
        }

        

        // parse amount + check

        if (!item.useable) {
            interaction.reply({ content: `This item isnt even usable lol` })
            return false
        }


        if (item.multiple_usable) {
            const specified_amount = interaction.options.getString('amount')
            amount = specified_amount ? await decodeNumber(specified_amount) : 1
        }

        const item_ownership = await SQL("SELECT * FROM inventory WHERE item_id=? AND user_id=? AND amount > ?", [item.id, user.id, 0])
        if (!item_ownership.length || item_ownership[0].amount < amount) {
            interaction.reply({ content: `You don't even have that much of ${item.item_name} lol...` })
            return false
        }

        // if targetable -> execute

        if (item.targetable) {
            // check for already active
            const target = await getUserData(interaction.options.getUser('user')?.id ? (interaction.options.getUser('user')!.id) : '0')

            if (!target) {
                interaction.reply({ content: "You need to select a person..." })
                return false
            }

            const check = await addAdctiveItem(target.id, item.id, item.active_duration)

            if (!check) {
                interaction.reply({ content: `This item is already active...` })
                return false
            }
            //execute + insert record

            const i: BotItem = client.items.get((item.item_name).toLowerCase())

            if (!i) {
                interaction.reply({ content: `This item isn't even useable lol` })
                return false
            }
            if(await i.execute(client, interaction)) await setItemAmount(user.id, item.id, item_ownership[0].amount - amount)
            return true
        }

        // if activable -> execute

        if (item.activable) {
            const check = await addAdctiveItem(user.id, item.id, item.active_duration)

            if (!check) {
                interaction.reply({ content: `This item is already active...` })
                return false
            }
            //execute + insert record

            const i: BotItem = client.items.get((item.item_name).toLowerCase())

            if (!i) {
                interaction.reply({ content: `This item isn't even usable lol` })
                return false
            }

            if(await i.execute(client, interaction)) await setItemAmount(user.id, item.id, item_ownership[0].amount - amount)
            return true
        }

        // if useable -> execute

        if (item.useable) {

            const i: BotItem = client.items.get((item.item_name).toLowerCase())

            if (!i) {
                interaction.reply({ content: `This item isn't even usable lol` })
                return false
            }

            if(await i.execute(client, interaction)) await setItemAmount(user.id, item.id, item_ownership[0].amount - amount)
            return true
        }

        // else -> not useable return false


        interaction.reply({ content: `This item isn't even usable lol` })
        return false
    }

    async getSlash(): Promise<SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">> {

        const items = await SQL("SELECT * FROM items WHERE useable=1 ORDER BY item_name")

        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => {
                option.setName('item')
                    .setDescription('Item you want to buy')
                    .setRequired(true)

                for (const item of items) {
                    option.addChoice(item.item_name, (item.item_name).toLowerCase())
                }

                return option
            })
            .addStringOption(option => option.setName('amount').setDescription('Amount of the selected item you want to use at the same time.'))
            .addUserOption(option => option.setName('user').setDescription('Select a user if item is targetable'));
    }
}


