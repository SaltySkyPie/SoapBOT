import log from "../functions/log.js";
import SoapClient from "../types/client";

export default async function execute(
  client: SoapClient,
  id: number,
  replayedEvents: number
) {
  log(
    "INFO",
    client.shardId,
    `Shard ${client.shardId} resumed. Replayed events: ${replayedEvents}`
  );
}
