import prisma from "../lib/prisma.js";

export default async function setItemAmount(
  userId: number,
  itemId: number,
  amount: number
) {
  return await prisma.inventory.update({
    where: {
      user_id_item_id: {
        user_id: userId,
        item_id: itemId,
      },
    },
    data: {
      amount: amount,
    },
  });
}
