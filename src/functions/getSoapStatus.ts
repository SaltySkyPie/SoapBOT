import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function getSoapStatus(userId: Snowflake) {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: { soap_status: true },
  });
  return user?.soap_status ?? 0;
}
