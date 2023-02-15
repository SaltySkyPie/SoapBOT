import { Snowflake } from "discord.js";
import getMysqlDateTime from "./getMysqlDateTime.js";
import SQL from "./SQL.js";

export default async function checkActiveItem(userId: number, itemId: number) {
  const date = getMysqlDateTime();
  const r = await SQL(
    "SELECT id FROM active_items WHERE user_id=? AND item_id=? AND expiration_date>?",
    [userId, itemId, date]
  );
  return r.length ? true : false;
}
