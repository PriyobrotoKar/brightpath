import { PrismaClient } from '@brightpath/db';

export async function createCategoryIfNotExist(
  name: string,
  prisma: PrismaClient,
) {
  let category = await prisma.category.findUnique({
    where: { name },
  });

  if (!category) {
    category = await prisma.category.create({
      data: { name },
    });
  }

  return category;
}
