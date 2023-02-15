import { Snowflake } from "discord.js";
import SQL from "./SQL.js";

export default async function getUserData(userId: Snowflake) {
  return (await SQL("SELECT * FROM users WHERE user_id=?", [userId]))[0];
}
