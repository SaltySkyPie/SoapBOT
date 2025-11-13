import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function getUserData(userId: Snowflake) {
  return await prisma.user.findUnique({
    where: { user_id: userId },
  });
}
