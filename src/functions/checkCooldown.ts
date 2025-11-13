import { Snowflake } from "discord.js";
import getMysqlDateTime from "./getMysqlDateTime.js";
import getTimeRemaining from "./getTimeRemaining.js";
import prisma from "../lib/prisma.js";

export default async function checkCooldown(
  userId: Snowflake,
  commandId: number
) {
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: { id: true },
  });

  if (!user) return false;

  const now = new Date(getMysqlDateTime());
  const cooldown = await prisma.commandCooldown.findFirst({
    where: {
      command_id: commandId,
      user_id: user.id,
      expiration: { gt: now },
    },
    orderBy: { id: 'desc' },
  });

  if (cooldown) {
    const remaining = getTimeRemaining(
      cooldown.expiration,
      getMysqlDateTime()
    );

    const d = remaining.days ? `${remaining.days}d ` : "";
    const h = remaining.hours ? `${remaining.hours}h ` : "";
    const m = remaining.minutes ? `${remaining.minutes}m ` : "";
    const s = remaining.seconds ? `${remaining.seconds}s ` : "0s";
    return `${d + h + m + s}`;
  } else {
    return false;
  }
}
