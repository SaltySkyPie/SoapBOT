import log from "../functions/log.js";
import SoapClient from "../types/client";


export default async function execute(client: SoapClient) {
    log("WARNING", client.shardId, `Shard ${client.shardId} is reconnecting...`)
}