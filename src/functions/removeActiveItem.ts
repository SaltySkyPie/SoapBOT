import prisma from "../lib/prisma.js";

export default async function removeActiveItem(userId: number, itemId: number) {
  await prisma.activeItem.deleteMany({
    where: {
      item_id: itemId,
      user_id: userId,
    },
  });
}
