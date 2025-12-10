import { SoapClient } from "../core/index.js";

export default async function getServerCount(client: SoapClient) {
  const req = await client.shard!.fetchClientValues("guilds.cache.size");
  return req.reduce((p: any, n: any) => p + n, 0);
}
