import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function checkBan(userId: Snowflake) {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    include: {
      bans_bans_user_idTousers: { select: { reason: true }, take: 1, orderBy: { id: "desc" } },
    },
  });
  return user && user.bans_bans_user_idTousers.length > 0
    ? user.bans_bans_user_idTousers[0].reason
    : false;
}
