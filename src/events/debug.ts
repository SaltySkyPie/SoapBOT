import log from "../functions/log.js";
import SoapClient from "../types/client";

export default async function execute(client: SoapClient, debug: string) {
  log("DEBUG", client.shardId, debug);
}
