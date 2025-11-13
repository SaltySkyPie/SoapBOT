import { Snowflake } from "discord.js";
import getMysqlDateTime from "./getMysqlDateTime.js";
import prisma from "../lib/prisma.js";

export default async function putOnCooldown(
  userId: Snowflake,
  commandId: number
) {
  const [command, user] = await Promise.all([
    prisma.command.findUnique({
      where: { id: commandId },
      select: { cooldown: true },
    }),
    prisma.user.findUnique({
      where: { user_id: userId },
      select: { id: true },
    }),
  ]);

  if (!command || !user) return;

  await prisma.commandCooldown.create({
    data: {
      user_id: user.id,
      command_id: commandId,
      expiration: new Date(getMysqlDateTime(command.cooldown * 1000)),
    },
  });
}
