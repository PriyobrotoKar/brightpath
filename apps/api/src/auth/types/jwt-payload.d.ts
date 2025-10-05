import { Role } from '@brightpath/db';

export type JWTPayload = {
  id: string;
  email: string;
  role: Role;
};
