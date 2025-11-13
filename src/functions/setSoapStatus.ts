import prisma from "../lib/prisma.js";
import { Snowflake } from "discord.js";

export default async function setSoapStatus(
  userId: Snowflake,
  newStatus: number
) {
  return await prisma.user.update({
    where: { user_id: userId },
    data: { soap_status: newStatus },
  });
}
