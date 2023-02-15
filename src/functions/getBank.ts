import { Snowflake } from "discord.js";
import SQL from "./SQL.js";

export default async function getBank(userId: Snowflake) {
  const result = await SQL(
    `SELECT stash, max_stash FROM users WHERE user_id=?`,
    [userId]
  );
  return result.length ? [result[0].stash, result[0].max_stash] : [0, 0];
}
