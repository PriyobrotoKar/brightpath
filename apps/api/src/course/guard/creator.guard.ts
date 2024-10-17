import { CacheService } from '@/cache/cache.service';
import { getUserByEmailOrId } from '@/common/user';
import { IS_CREATOR_KEY } from '@/decorators/role.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { JWTPayload } from '@/auth/types/jwt-payload';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CreatorGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isCreator = this.reflector.getAll(IS_CREATOR_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!isCreator) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const payload = request.user as JWTPayload;

    const user = await getUserByEmailOrId(payload.id, this.prisma, this.cache);
    if (user.role === 'CREATOR') return true;
    else return false;
  }
}
