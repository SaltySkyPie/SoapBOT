import { Snowflake } from "discord.js";
import SQL from "./SQL.js";

export default async function setPoints(userId: Snowflake, newPoints: number) {
  const inserted_points = await SQL(
    `UPDATE users SET points=? WHERE user_id=?`,
    [newPoints, userId]
  );
  return inserted_points;
}
