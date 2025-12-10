import log from "../functions/log.js";
import { SoapClient } from "../core/index.js";

export default async function execute(client: SoapClient) {
  log("WARNING", client.shardId, `Shard ${client.shardId} is reconnecting...`);
}
