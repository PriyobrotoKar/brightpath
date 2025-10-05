import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';
import { JWTPayload } from '../types/jwt-payload';
import { IS_OPTIONAL_KEY } from '@/decorators/optional.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = JWTPayload>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext,
  ): TUser | null {
    const isOptional = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isOptional && !user) {
      return null;
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
