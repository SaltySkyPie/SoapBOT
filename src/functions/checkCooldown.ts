import { Snowflake } from "discord.js";
import getMysqlDateTime from "./getMysqlDateTime.js";
import getTimeRemaining from "./getTimeRemaining.js";
import SQL from "./SQL.js";



export default async function checkCooldown(userId: Snowflake, commandId: number) {
    const cooldown = await SQL("SELECT expiration FROM command_cooldowns WHERE command_id=? AND user_id=(SELECT id FROM users WHERE user_id=?) AND expiration>?", [commandId, userId, getMysqlDateTime()])
    if(cooldown.length) {
        const remaining = getTimeRemaining(cooldown[cooldown.length - 1].expiration, getMysqlDateTime())

        const d = remaining.days ? `${remaining.days}d ` : "";
        const h = remaining.hours ? `${remaining.hours}h ` : "";
        const m = remaining.minutes ? `${remaining.minutes}m ` : "";
        const s = remaining.seconds ? `${remaining.seconds}s ` : "0s";
        return `${d + h + m + s}`
    } else {
        return false
    }
}