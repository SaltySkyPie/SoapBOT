import SoapClient from "../types/client"
import * as fs from 'fs'
import log from "../functions/log.js";
import SQL from "../functions/SQL.js";
import BotItem from "../items/rope";

export default async function handle(client: SoapClient) {
    const items = fs.readdirSync('./items/').filter(file => file.endsWith('.js'));

    for (const item of items) {
        log("INFO", client.shardId, `Loading item ${item.split(".")[0]}...`)
        const it = (await import(`../items/${item}`))

        const db_item = (await SQL("SELECT id, item_name, description FROM items WHERE item_name=?", [item.split(".")[0]]))[0]
        if(!db_item) continue
        const i: BotItem = new it.default(db_item.id, (db_item.item_name).toLowerCase(), db_item.description)

        client.items.set(i.name, i)

        log("INFO", client.shardId, `Item ${item.split(".")[0]}(${db_item.id}) loaded.`)
    }

    log("INFO", client.shardId, `All items loaded`)
}