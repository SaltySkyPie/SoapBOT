import { SoapClient } from "../core/index.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import "dotenv/config";
import log from "./log.js";

async function registerSlash(client: SoapClient) {
  log("INFO", client.shardId, `Started refreshing application (/) commands.`);

  if (client.commands.size) {
    const commandsJson: any[] = [];

    for (const [, command] of client.commands) {
      commandsJson.push((await command.getSlash()).toJSON());
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

    await rest.put(Routes.applicationCommands("908817514480406628"), { body: commandsJson });

    log("INFO", client.shardId, `Successfully refreshed application (/) commands.`);
  }
}

export default registerSlash;
