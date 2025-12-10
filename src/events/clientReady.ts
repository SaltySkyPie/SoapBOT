import log from "../functions/log.js";
import { SoapClient } from "../core/index.js";
import { ActivityType, PresenceStatusData } from "discord.js";
import ms from "ms";

const BOT_STATUS: PresenceStatusData = "online";
const BOT_PRESENCE = "/help 🧼 soapbot.saltyskypie.com";

export default async function execute(client: SoapClient) {
  updateStatus(client);
  setInterval(() => updateStatus(client), ms("30m"));
}

function updateStatus(client: SoapClient) {
  log("INFO", global.shardId, `Updating presence status to ${BOT_STATUS} - "${BOT_PRESENCE}"`);
  client.user?.setPresence({
    activities: [{ name: BOT_PRESENCE, type: ActivityType.Playing }],
    status: BOT_STATUS,
  });
}
