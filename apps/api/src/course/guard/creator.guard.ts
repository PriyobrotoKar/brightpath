import { CacheService } from '@/cache/cache.service';
import { getUserByEmailOrId } from '@/common/user';
import { IS_CREATOR_KEY } from '@/decorators/role.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { JWTPayload } from '@/auth/types/jwt-payload';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@brightpath/db';
import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';

@Injectable()
export class CreatorGuard implements CanActivate {
  private readonly prisma: PrismaClient;
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
    private cache: CacheService,
  ) {
    this.prisma = this.prismaService.client;
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

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
