import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function updateTag(userID: Snowflake, tag: string) {
  const user = await prisma.users.findUnique({
    where: { user_id: userID },
    select: { tag: true },
  });
  if (user && user.tag !== tag) {
    await prisma.users.update({
      where: { user_id: userID },
      data: { tag },
    });
  }
}
