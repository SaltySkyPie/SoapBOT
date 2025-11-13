import SoapClient from "../types/client";
import * as fs from "fs";
import log from "../functions/log.js";
import prisma from "../lib/prisma.js";
import BotItem from "../items/rope";

export default async function handle(client: SoapClient) {
  const items = fs
    .readdirSync("./items/")
    .filter((file) => file.endsWith(".js"));

  for (const item of items) {
    log("INFO", client.shardId, `Loading item ${item.split(".")[0]}...`);
    const it = await import(`../items/${item}`);

    const db_item = await prisma.item.findUnique({
      where: { item_name: item.split(".")[0] },
      select: { id: true, item_name: true, description: true },
    });
    if (!db_item || !db_item.item_name) continue;
    const i: BotItem = new it.default(
      Number(db_item.id),
      db_item.item_name.toLowerCase(),
      db_item.description || ""
    );

    client.items.set(i.name, i);

    log(
      "INFO",
      client.shardId,
      `Item ${item.split(".")[0]}(${db_item.id}) loaded.`
    );
  }

  log("INFO", client.shardId, `All items loaded`);
}
