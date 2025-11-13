import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function updateTag(userID: Snowflake, tag: string) {
  const user = await prisma.user.findUnique({
    where: { user_id: userID },
    select: { tag: true },
  });
  if (user && user.tag !== tag) {
    await prisma.user.update({
      where: { user_id: userID },
      data: { tag },
    });
  }
}
