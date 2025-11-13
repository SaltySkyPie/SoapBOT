import SoapClient from "../types/client";
import * as fs from "fs";
import log from "../functions/log.js";
import prisma from "../lib/prisma.js";
import BotCommand from "../commands/ping";
import fetch from "node-fetch";

export default async function handle(client: SoapClient) {
  const dblCommands = [];

  const commands = fs
    .readdirSync("./commands/")
    .filter((file) => file.endsWith(".js"));

  for (const command of commands) {
    log("INFO", client.shardId, `Loading command ${command.split(".")[0]}...`);
    const cmd = await import(`../commands/${command}`);

    const db_command = await prisma.command.findUnique({
      where: { command: command.split(".")[0] },
      select: { id: true, command: true, description: true },
    });
    if (!db_command) continue;
    const c: BotCommand = new cmd.default(
      Number(db_command.id),
      db_command.command,
      db_command.description
    );

    client.commands.set(c.name, c);

    dblCommands.push({
      name: db_command.command,
      description: db_command.description,
      type: 1,
    });

    log(
      "INFO",
      client.shardId,
      `Command ${command.split(".")[0]}(${db_command.id}) loaded.`
    );
  }

  log("INFO", client.shardId, `All commands loaded`);
  log("INFO", client.shardId, `Sending commands list to DBL...`);
  const f = await fetch(
    `https://discordbotlist.com/api/v1/bots/908817514480406628/commands`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${process.env.DBL_TOKEN}`,
      },
      body: JSON.stringify(dblCommands),
    }
  );

  log(
    "INFO",
    client.shardId,
    `Finished sending commands list to DBL. (${f.status} ${f.statusText})`
  );
}
