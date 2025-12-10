import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";

export default async function updateAvatar(
  userID: Snowflake,
  avatarURL: string
) {
  const user = await prisma.users.findUnique({
    where: { user_id: userID },
    select: { avatar_url: true },
  });
  if (user && user.avatar_url !== avatarURL) {
    await prisma.users.update({
      where: { user_id: userID },
      data: { avatar_url: avatarURL },
    });
  }
}
