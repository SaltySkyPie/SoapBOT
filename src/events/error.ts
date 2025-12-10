import log from "../functions/log.js";
import { SoapClient } from "../core/index.js";

export default async function execute(client: SoapClient, error: string) {
  log("ERROR", client.shardId, error);
}
