import prisma from "../lib/prisma.js";

export default async function removeActiveItem(userId: number | bigint, itemId: number | bigint) {
  await prisma.activeItem.deleteMany({
    where: {
      item_id: BigInt(itemId),
      user_id: BigInt(userId),
    },
  });
}
