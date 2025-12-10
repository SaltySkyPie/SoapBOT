import { Snowflake } from "discord.js";
import prisma from "../lib/prisma.js";
import { formatCooldownRemaining } from "../utils/time.js";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";

dayjs.extend(duration);

export default async function checkCooldown(userId: Snowflake, commandId: number | bigint) {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: { id: true },
  });

  if (!user) return false;

  const now = new Date();
  const cooldown = await prisma.command_cooldowns.findFirst({
    where: {
      command_id: BigInt(commandId),
      user_id: user.id,
      expiration: { gt: now },
    },
    orderBy: { id: "desc" },
  });

  if (cooldown && cooldown.expiration) {
    // Calculate remaining time (expiration - now)
    const remainingMs = dayjs(cooldown.expiration).diff(dayjs());

    if (remainingMs <= 0) return false;

    const d = dayjs.duration(remainingMs);
    return formatCooldownRemaining({
      total: remainingMs,
      days: Math.floor(d.asDays()),
      hours: d.hours(),
      minutes: d.minutes(),
      seconds: d.seconds(),
    });
  } else {
    return false;
  }
}
