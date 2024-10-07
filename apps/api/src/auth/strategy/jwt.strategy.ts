import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { jwtExtractor } from '@/common/utils';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: jwtExtractor,
      ignoreExpiration: false,
      secretOrKey: 'secret',
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
