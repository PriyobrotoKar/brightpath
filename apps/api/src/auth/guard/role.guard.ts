import { CacheService } from '@/cache/cache.service';
import { ROLES_KEY } from '@/decorators/role.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { JWTPayload } from '@/auth/types/jwt-payload';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient, Role } from '@brightpath/db';
import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';
import { IS_OPTIONAL_KEY } from '@/decorators/optional.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
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

    const isOptional = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const payload = request.user as JWTPayload;

    if (isOptional && !payload) return true;

    return requiredRoles.some((role) => payload.role === role);
  }
}
