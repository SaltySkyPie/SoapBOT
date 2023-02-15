import { Snowflake } from "discord.js";
import SQL from "./SQL.js";

export default async function setBank(userId: Snowflake, newPoints: number) {
  newPoints = await SQL(`UPDATE users SET stash=? WHERE user_id=?`, [
    newPoints,
    userId,
  ]);
  return newPoints;
}
