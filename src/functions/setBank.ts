import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function setBank(userId: Snowflake, newPoints: number) {
  await prisma.users.update({
    where: { user_id: userId },
    data: { stash: newPoints },
  });
  return newPoints;
}
