import { Snowflake } from "discord.js";
import getMysqlDateTime from "./getMysqlDateTime.js";
import SQL from "./SQL.js";

export default async function putOnCooldown(
  userId: Snowflake,
  commandId: number
) {
  const command = (
    await SQL("SELECT cooldown FROM commands WHERE id=?", [commandId])
  )[0];
  await SQL(
    "INSERT INTO command_cooldowns (user_id, command_id, expiration) VALUES ((SELECT id FROM users WHERE user_id=?),?,?)",
    [userId, commandId, getMysqlDateTime(command.cooldown * 1000)]
  );
}
