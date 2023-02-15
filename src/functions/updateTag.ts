import { Snowflake } from "discord.js";
import SQL from "./SQL.js";

export default async function updateTag(userID: Snowflake, tag: string) {
  const user = await SQL("SELECT tag FROM users WHERE user_id=?", [userID]);
  if (user) {
    if (user[0].tag != tag) {
      await SQL("UPDATE users SET tag=? WHERE user_id=?", [tag, userID]);
    }
  }
}
