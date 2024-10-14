import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { jwtExtractor } from '@/common/utils';
import { Inject } from '@nestjs/common';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { Request } from 'express';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: (req: Request) => jwtExtractor(req, 'access_token'),
      ignoreExpiration: false,
      secretOrKey: jwtConfiguration.secret,
    });
  }

  async validate(payload: any) {
    return { id: payload.id, email: payload.email };
  }
}
