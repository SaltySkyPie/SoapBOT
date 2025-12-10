import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function getBank(userId: Snowflake) {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: { stash: true, max_stash: true },
  });
  return user ? [Number(user.stash), Number(user.max_stash)] : [0, 0];
}
