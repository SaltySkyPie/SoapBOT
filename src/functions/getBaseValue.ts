import prisma from "../lib/prisma.js";

export default async function getBaseValue(name: string) {
  const baseValue = await prisma.baseValue.findUnique({
    where: { value: name },
    select: { content: true },
  });
  return baseValue?.content || null;
}
