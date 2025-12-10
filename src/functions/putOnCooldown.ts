import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";
import { getFutureTimestamp } from "../utils/time.js";

export default async function putOnCooldown(
  userId: Snowflake,
  commandId: number | bigint
) {
  const [command, user] = await Promise.all([
    prisma.command.findUnique({
      where: { id: BigInt(commandId) },
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
      command_id: BigInt(commandId),
      expiration: getFutureTimestamp(Number(command.cooldown) * 1000),
    },
  });
}
