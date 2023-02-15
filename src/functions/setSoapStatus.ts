import SQL from "./SQL.js";
import { Snowflake } from "discord.js";

export default async function setSoapStatus(
  userId: Snowflake,
  newStatus: number
) {
  return await SQL(`UPDATE users SET soap_status=? WHERE user_id=?`, [
    newStatus,
    userId,
  ]);
}
