import prisma from "../lib/prisma.js";

export default async function getItemByName(name: string) {
  return await prisma.item.findUnique({
    where: { item_name: name },
  });
}
