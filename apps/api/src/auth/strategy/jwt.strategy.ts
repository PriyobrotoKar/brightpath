import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { cookieExtractor } from '@/common/utils';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: 'secret',
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
