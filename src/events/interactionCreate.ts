import { CommandInteraction, Interaction, MessageEmbed } from "discord.js";
import BotCommand from "../commands/ping.js";
import checkBan from "../functions/checkBan.js";
import checkCooldown from "../functions/checkCooldown.js";
import checkUserCreation from "../functions/checkUserCreation.js";
import getMysqlDateTime from "../functions/getMysqlDateTime.js";
import log from "../functions/log.js";
import putOnCooldown from "../functions/putOnCooldown.js";
import SQL from "../functions/SQL.js";
import SoapClient from "../types/client";


export default async function execute(client: SoapClient, interaction: Interaction) {
    if (interaction.isCommand()) {
        const i: CommandInteraction = interaction as CommandInteraction

        const command: BotCommand = client.commands.get(interaction.commandName)
        if (!command) return




        const u = i.options.getUser("user")
        await Promise.all([
            await checkUserCreation(i.user.id),
            u ? await checkUserCreation(u.id) : null,
            await SQL("DELETE FROM active_items WHERE expiration_date<=?", [getMysqlDateTime()]),

        ])


        const [cooldown, ban] = await Promise.all([
            checkCooldown(i.user.id, command.id),
            checkBan(i.user.id),
        ])

        if (ban) {
            interaction.reply({ embeds: [new MessageEmbed().setColor("#ff00e4").setTitle("You are banned!").setDescription(`for **${ban}**`)], ephemeral: true })
            log("INFO", global.shardId, `${i.user.tag} issued command /${command.name} in ${i.guild?.name} but was banned.`)
            return
        }

        if (cooldown) {
            interaction.reply({ embeds: [new MessageEmbed().setColor("#ff00e4").setTitle(`Slow down bruh...`).setDescription(`Please wait **${cooldown}** before running **/${command.name}** again.`)], ephemeral: true })
            log("INFO", global.shardId, `${i.user.tag} issued command /${command.name} in ${i.guild?.name} but was on cooldown.`)
            return
        }

        const result = await command.execute(client, i)

        if (result) {
            await putOnCooldown(i.user.id, command.id)
        }
        
        log("INFO", global.shardId, `${i.user.tag} issued command /${command.name} in ${i.guild?.name}.`)

    }
    return
}