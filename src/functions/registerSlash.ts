import SoapClient from "../types/client";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import "dotenv/config";
import log from "./log.js";

async function registerSlash(client: SoapClient) {
  log("INFO", client.shardId, `Started refreshing application (/) commands.`);

  const list = client.commands;

  if (list.size) {
    const commands: any = [];

    for (const [name, object] of list) {
      commands.push((await object.getSlash()).toJSON());
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

    await rest.put(
      //Routes.applicationCommands('908817514480406628'),
      Routes.applicationGuildCommands(
        "950804030148444180",
        "910660654443135026"
      ),
      { body: commands }
    );
    log(
      "INFO",
      client.shardId,
      `Successfully refreshed application (/) commands.`
    );
  }
}

export default registerSlash;
