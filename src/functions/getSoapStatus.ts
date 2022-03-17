import { Snowflake } from "discord.js";
import SQL from "./SQL.js";


export default async function getSoapstatus(userId: Snowflake) {
    const result = await SQL(`SELECT soap_status FROM users WHERE user_id=?`, [userId])
    return result.length ? result[result.length - 1].soap_status : 0
}
