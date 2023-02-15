import { Client, Intents, Collection } from "discord.js";
import log from "./functions/log.js";
import * as fs from "fs";
import "dotenv/config";
import SoapClient from "./types/client.js";
import SQL from "./functions/SQL.js";

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
}) as SoapClient;

const handlers = fs
  .readdirSync("./handlers/")
  .filter((file) => file.endsWith(".js"));
client.shardId = "-";
global.shardId = "-";
client.commands = new Collection();
client.events = new Collection();
client.items = new Collection();

for (const handler of handlers) {
  const { default: handle } = await import(`./handlers/${handler}`);
  log("INFO", client.shardId, `Executing handler ${handler.split(".")[0]}.`);
  await handle(client);
}

log("INFO", client.shardId, `Launching client...`);
client.login(process.env.TOKEN);
