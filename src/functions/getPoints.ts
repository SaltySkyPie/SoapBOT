import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function getPoints(userId: Snowflake) {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: { points: true },
  });
  return user ? Number(user.points) : 0;
}
