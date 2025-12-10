import prisma from "../lib/prisma.js";
import { getMysqlDateTime } from "../utils/time.js";

export default async function checkActiveItem(userId: number | bigint, itemId: number | bigint) {
  const now = new Date(getMysqlDateTime());
  const activeItem = await prisma.active_items.findFirst({
    where: {
      user_id: BigInt(userId),
      item_id: BigInt(itemId),
      expiration_date: { gt: now },
    },
  });
  return !!activeItem;
}
