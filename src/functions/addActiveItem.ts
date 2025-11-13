import getMysqlDateTime from "./getMysqlDateTime.js";
import prisma from "../lib/prisma.js";

export default async function addAdctiveItem(
  userId: number,
  itemId: number,
  activeSeconds: number
) {
  const now = new Date(getMysqlDateTime());
  const checkActiveItem = await prisma.activeItem.findFirst({
    where: {
      user_id: userId,
      item_id: itemId,
      expiration_date: { gt: now },
    },
  });

  if (checkActiveItem) {
    return false;
  } else {
    await prisma.activeItem.deleteMany({
      where: {
        user_id: userId,
        item_id: itemId,
      },
    });
    const date = new Date(getMysqlDateTime(activeSeconds * 1000));
    await prisma.activeItem.create({
      data: {
        user_id: userId,
        item_id: itemId,
        expiration_date: date,
      },
    });
    return true;
  }
}
