import prisma from "../lib/prisma.js";

export default async function addItem(
  user_id: number | bigint | string,
  item_id: number | bigint | string,
  count: number
) {
  const userId = BigInt(user_id);
  const itemId = BigInt(item_id);

  const existing = await prisma.inventory.findFirst({
    where: {
      user_id: userId,
      item_id: itemId,
    },
  });

  if (existing) {
    await prisma.inventory.update({
      where: {
        id: existing.id,
      },
      data: {
        amount: (existing.amount || 0) + count,
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
