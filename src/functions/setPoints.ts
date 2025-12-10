import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function setPoints(userId: Snowflake, newPoints: number) {
  await prisma.users.update({
    where: { user_id: userId },
    data: { points: newPoints },
  });
  return newPoints;
}
