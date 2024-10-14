import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { jwtExtractor } from '@/common/utils';
import { Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { AuthService } from '../auth.service';

export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: (req: Request) => jwtExtractor(req, 'refresh_token'),
      ignoreExpiration: false,
      secretOrKey: refreshJwtConfiguration.secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = jwtExtractor(req, 'refresh_token');
    return await this.authService.validateRefreshToken(refreshToken, payload);
  }
}
