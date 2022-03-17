import { Snowflake } from "discord.js";
import SQL from "./SQL.js";



export default async function checkUserCreation(userId: Snowflake) {
    const u = await SQL("SELECT id FROM users WHERE user_id=?", [userId])
    if(!u.length) {
        await SQL("INSERT INTO users (user_id) VALUES (?)", [userId])
    }
    return
}