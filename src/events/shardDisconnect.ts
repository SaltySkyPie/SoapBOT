import log from "../functions/log.js";
import SoapClient from "../types/client";


export default async function execute(client: SoapClient, event: CloseEvent) {
    log("WARNING", client.shardId, [`Shard ${client.shardId} was disconnected and will not reconnect. `, event])
}