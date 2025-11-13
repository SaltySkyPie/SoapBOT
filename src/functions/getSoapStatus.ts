import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function getSoapstatus(userId: Snowflake) {
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: { soap_status: true },
  });
  return user?.soap_status ?? 0;
}
