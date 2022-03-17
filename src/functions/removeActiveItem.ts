import SQL from "./SQL.js";


export default async function removeActiveItem(userId: number, itemId: number) {
    SQL("DELETE FROM active_items WHERE item_id=? AND user_id=?", [itemId, userId])
}