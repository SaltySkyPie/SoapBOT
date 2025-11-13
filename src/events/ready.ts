import log from "../functions/log.js";
import SoapClient from "../types/client";
import getBaseValue from "../functions/getBaseValue.js";
import { PresenceUpdateStatus, ActivityType } from "discord.js";

export default async function execute(client: SoapClient) {
  updateStatus(client);
  setInterval(async () => {
    updateStatus(client);
  }, 1000 * 60 * 30);
}

async function updateStatus(client: SoapClient) {
  const [status, presence] = await Promise.all([
    getBaseValue("status"),
    getBaseValue("presence"),
  ]);
  log(
    "INFO",
    global.shardId,
    `Updating presence status to ${status} - "${presence}"`
  );
  client.user?.setPresence({
    activities: [{ name: `${presence}`, type: ActivityType.Playing }],
    status: status as any,
  });
}
