import { Snowflake } from "discord.js";
import getMysqlDateTime from "./getMysqlDateTime.js";
import prisma from "../lib/prisma.js";

export default async function checkActiveItem(userId: number | bigint, itemId: number | bigint) {
  const now = new Date(getMysqlDateTime());
  const activeItem = await prisma.activeItem.findFirst({
    where: {
      user_id: BigInt(userId),
      item_id: BigInt(itemId),
      expiration_date: { gt: now },
    },
  });
  return activeItem ? true : false;
}
