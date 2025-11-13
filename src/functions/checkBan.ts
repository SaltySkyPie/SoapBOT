import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function checkBan(userId: Snowflake) {
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    include: { bans: { select: { reason: true }, take: 1, orderBy: { id: 'desc' } } },
  });
  return user && user.bans.length > 0 ? user.bans[0].reason : false;
}
