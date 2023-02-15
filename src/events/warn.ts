import log from "../functions/log.js";
import SoapClient from "../types/client";

export default async function execute(client: SoapClient, warn: string) {
  log("WARNING", client.shardId, warn);
}
