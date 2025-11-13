import getMysqlDateTime from "./getMysqlDateTime.js";
import prisma from "../lib/prisma.js";

export default async function addAdctiveItem(
  userId: number | bigint,
  itemId: number | bigint,
  activeSeconds: number
) {
  const userIdBigInt = BigInt(userId);
  const itemIdBigInt = BigInt(itemId);
  const now = new Date(getMysqlDateTime());

  const checkActiveItem = await prisma.activeItem.findFirst({
    where: {
      user_id: userIdBigInt,
      item_id: itemIdBigInt,
      expiration_date: { gt: now },
    },
  });

  if (checkActiveItem) {
    return false;
  } else {
    await prisma.activeItem.deleteMany({
      where: {
        user_id: userIdBigInt,
        item_id: itemIdBigInt,
      },
    });
    const date = new Date(getMysqlDateTime(activeSeconds * 1000));
    await prisma.activeItem.create({
      data: {
        user_id: userIdBigInt,
        item_id: itemIdBigInt,
        expiration_date: date,
      },
    });
    return true;
  }
}
