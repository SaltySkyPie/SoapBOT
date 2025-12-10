import log from "../functions/log.js";
import { SoapClient } from "../core/index.js";

export default async function execute(client: SoapClient, id: number, replayedEvents: number) {
  log(
    "INFO",
    client.shardId,
    `Shard ${client.shardId} resumed. Replayed events: ${replayedEvents}`
  );
}
