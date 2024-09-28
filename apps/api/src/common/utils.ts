import type { Request } from 'express';

export function cookieExtractor(req: Request) {
  const token = req.cookies.access_token?.split(' ')[1] ?? undefined;
  return token;
}
