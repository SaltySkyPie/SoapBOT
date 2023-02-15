import { Snowflake } from "discord.js";
import SQL from "./SQL.js";

export default async function getPoints(userId: Snowflake) {
  const points = await SQL(`SELECT points FROM users WHERE user_id=?`, [
    userId,
  ]);
  return points.length ? points[points.length - 1].points : 0;
}
