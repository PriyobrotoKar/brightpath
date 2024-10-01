import { CacheService } from '@/cache/cache.service';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@brightpath/db';

export async function getUserByEmailOrId(
  search: string,
  prisma: PrismaService,
  cache: CacheService,
): Promise<User | null> {
  const cachedUser = await cache.getCachedValue('user', search);

  if (cachedUser) {
    return cachedUser;
  }

  const user =
    (await prisma.user.findUnique({
      where: {
        email: search,
      },
    })) ??
    (await prisma.user.findUnique({
      where: {
        id: search,
      },
    }));

  if (!user) {
    return null;
  }

  await cache.setCache('user', user.id, user);

  return user;
}
