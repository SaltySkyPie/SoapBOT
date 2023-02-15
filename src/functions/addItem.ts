import SQL from "./SQL.js";

export default async function addItem(
  user_id: number | string,
  item_id: number | string,
  count: number
) {
  const amount: any = (
    await SQL(
      `SELECT inventory.amount as amount, count(amount) as c FROM inventory INNER JOIN users ON inventory.user_id=users.id INNER JOIN items ON inventory.item_id=items.id WHERE inventory.user_id=? AND inventory.item_id=?`,
      [user_id, item_id]
    )
  )[0];

  if (!amount) {
    return false;
  }

  if (!amount.c) {
    SQL("INSERT INTO inventory (amount, user_id, item_id) VALUES (?,?,?)", [
      count,
      user_id,
      item_id,
    ]);
  }

  SQL("UPDATE inventory SET amount=? WHERE item_id=? AND user_id=?", [
    amount.amount + count,
    item_id,
    user_id,
  ]);

  return true;
}
