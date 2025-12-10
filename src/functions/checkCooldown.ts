import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";
import { getMysqlDateTime, getTimeRemaining, formatCooldownRemaining } from "../utils/time.js";

export default async function checkCooldown(
  userId: Snowflake,
  commandId: number | bigint
) {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: { id: true },
  });

  if (!user) return false;

  const now = new Date(getMysqlDateTime());
  const cooldown = await prisma.command_cooldowns.findFirst({
    where: {
      command_id: BigInt(commandId),
      user_id: user.id,
      expiration: { gt: now },
    },
    orderBy: { id: 'desc' },
  });

  if (cooldown && cooldown.expiration) {
    const remaining = getTimeRemaining(cooldown.expiration, new Date());
    return formatCooldownRemaining(remaining);
  } else {
    return false;
  }
}
