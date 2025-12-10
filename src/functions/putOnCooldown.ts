import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";
import dayjs from "dayjs";

export default async function putOnCooldown(userId: Snowflake, commandId: number | bigint) {
  const [command, user] = await Promise.all([
    prisma.commands.findUnique({
      where: { id: BigInt(commandId) },
      select: { cooldown: true },
    }),
    prisma.users.findUnique({
      where: { user_id: userId },
      select: { id: true },
    }),
  ]);

  if (!command || !user) return;

  const now = new Date();

  // Check if an active cooldown already exists
  const existingCooldown = await prisma.command_cooldowns.findFirst({
    where: {
      user_id: user.id,
      command_id: BigInt(commandId),
      expiration: { gt: now },
    },
  });

  // Only create a new cooldown if one doesn't already exist
  if (!existingCooldown) {
    const expiration = dayjs().add(Number(command.cooldown), "second").toDate();
    await prisma.command_cooldowns.create({
      data: {
        user_id: user.id,
        command_id: BigInt(commandId),
        expiration,
      },
    });
  }
}
