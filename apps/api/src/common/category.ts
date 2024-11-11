import { PrismaService } from '@/prisma/prisma.service';

export async function createCategoryIfNotExist(
  name: string,
  prisma: PrismaService,
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
