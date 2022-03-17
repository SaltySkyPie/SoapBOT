import SoapClient from "../types/client"
import * as fs from 'fs'
import log from "../functions/log.js";
import SQL from "../functions/SQL.js";
import BotCommand from "../commands/ping";

export default async function handle(client: SoapClient) {
    const commands = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

    for (const command of commands) {
        log("INFO", client.shardId, `Loading command ${command.split(".")[0]}...`)
        const cmd = (await import(`../commands/${command}`))

        const db_command = (await SQL("SELECT id, command, description FROM commands WHERE command=?", [command.split(".")[0]]))[0]
        if(!db_command) continue
        const c: BotCommand = new cmd.default(db_command.id, db_command.command, db_command.description)

        client.commands.set(c.name, c)

        log("INFO", client.shardId, `Command ${command.split(".")[0]}(${db_command.id}) loaded.`)
    }

    log("INFO", client.shardId, `All commands loaded`)
}