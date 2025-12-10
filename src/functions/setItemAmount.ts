import prisma from "../lib/prisma.js";

export default async function setItemAmount(
  userId: number | bigint,
  itemId: number | bigint,
  amount: number
) {
  const inventory = await prisma.inventory.findFirst({
    where: {
      user_id: BigInt(userId),
      item_id: BigInt(itemId),
    },
  });

  if (!inventory) return null;

  return await prisma.inventory.update({
    where: {
      id: inventory.id,
    },
    data: {
      amount: amount,
    },
  });
}
