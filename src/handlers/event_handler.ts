import SoapClient from "../types/client";
import * as fs from 'fs'
import log from "../functions/log.js";

export default async function handle(client: SoapClient) {
    const events = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));

    for (const event of events) {
        const event_name = event.split(".")[0]
        log("INFO", client.shardId, `Loading event ${event_name}...`)
        const { default: execute } = await import(`../events/${event}`);
        client.on(event_name, execute.bind(null, client))
        log("INFO", client.shardId, `Event ${event_name} loaded.`)
    }

    log("INFO", client.shardId, `All events loaded`)
}