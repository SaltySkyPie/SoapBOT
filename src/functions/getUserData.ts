import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function getUserData(userId: Snowflake) {
  return await prisma.users.findUnique({
    where: { user_id: userId },
  });
}
