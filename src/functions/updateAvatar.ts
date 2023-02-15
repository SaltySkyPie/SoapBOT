import { Snowflake } from "discord.js";
import SQL from "./SQL.js";

export default async function updateAvatar(
  userID: Snowflake,
  avatarURL: string
) {
  const user = await SQL("SELECT avatar_url FROM users WHERE user_id=?", [
    userID,
  ]);
  if (user) {
    if (user[0].avatar_url != avatarURL) {
      await SQL("UPDATE users SET avatar_url=? WHERE user_id=?", [
        avatarURL,
        userID,
      ]);
    }
  }
}
