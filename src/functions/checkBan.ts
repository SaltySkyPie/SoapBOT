import { Snowflake } from "discord.js";
import SQL from "./SQL.js";

export default async function checkBan(userId: Snowflake) {
  const bans = await SQL(
    "SELECT bans.reason FROM bans INNER JOIN users ON bans.user_id=users.id WHERE bans.user_id=(SELECT id FROM users WHERE user_id=?)",
    [userId as string]
  );
  return bans.length ? bans[bans.length - 1].reason : false;
}
