import { AuthGuard } from '@nestjs/passport';

export class RefreshJwtAuthGuard extends AuthGuard('refresh-jwt') {}
