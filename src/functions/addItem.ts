import prisma from "../lib/prisma.js";

export default async function addItem(
  user_id: number | string,
  item_id: number | string,
  count: number
) {
  const userId = typeof user_id === 'string' ? parseInt(user_id) : user_id;
  const itemId = typeof item_id === 'string' ? parseInt(item_id) : item_id;

  const existing = await prisma.inventory.findUnique({
    where: {
      user_id_item_id: {
        user_id: userId,
        item_id: itemId,
      },
    },
  });

  if (existing) {
    await prisma.inventory.update({
      where: {
        user_id_item_id: {
          user_id: userId,
          item_id: itemId,
        },
      },
      data: {
        amount: Number(existing.amount) + count,
      },
    });
  } else {
    await prisma.inventory.create({
      data: {
        user_id: userId,
        item_id: itemId,
        amount: count,
      },
    });
  }

  return true;
}
