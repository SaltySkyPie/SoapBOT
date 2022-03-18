import log from "../functions/log.js";
import registerSlash from "../functions/registerSlash.js";
import SoapClient from "../types/client";


export default async function execute(client: SoapClient, id: number) {
    client.shardId = id
    global.shardId = id
    process
        .on('unhandledRejection', (e) => {
            log("ERROR", global.shardId, e)
        })
        .on('uncaughtException', (e) => {
            log("ERROR", global.shardId, e)
        })

    log("INFO", client.shardId, `Shard ${id} is now online!`)
    registerSlash(client)
}