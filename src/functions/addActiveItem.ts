import getMysqlDateTime from "./getMysqlDateTime.js";
import SQL from "./SQL.js";


export default async function addAdctiveItem(userId: number, itemId: number, activeSeconds: number) {
    const checkActiveItem = await SQL("SELECT expiration_date FROM active_items WHERE user_id=? AND item_id=? AND expiration_date>?", [userId, itemId, getMysqlDateTime()])
    if (checkActiveItem.length) {
        return false
    } else {
        await SQL("DELETE FROM active_items WHERE user_id=? AND item_id=?", [userId, itemId])
        const date = getMysqlDateTime(activeSeconds * 1000)
        await SQL('INSERT INTO active_items (user_id, item_id, expiration_date) VALUES (?,?,?)', [userId, itemId, date])
        return true
    }
}