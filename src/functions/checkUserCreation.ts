import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function checkUserCreation(userId: Snowflake) {
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: { id: true },
  });
  if (!user) {
    await prisma.user.create({
      data: { user_id: userId },
    });
  }
  return;
}
