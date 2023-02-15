import SQL from "./SQL.js";

export default async function setItemAmount(
  userId: number,
  itemId: number,
  amount: number
) {
  return await SQL(
    "UPDATE inventory SET amount=? WHERE user_id=? AND item_id=?",
    [amount, userId, itemId]
  );
}
