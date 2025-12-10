import log from "../functions/log.js";
import { SoapClient } from "../core/index.js";

export default async function execute(client: SoapClient, debug: string) {
  log("DEBUG", client.shardId, debug);
}
