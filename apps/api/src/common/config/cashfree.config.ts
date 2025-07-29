import { registerAs } from '@nestjs/config';

export default registerAs('cashfree', () => ({
  client_id: process.env.CASHFREE_CLIENT_ID,
  client_secret: process.env.CASHFREE_CLIENT_SECRET,
  api_version: process.env.CASHFREE_API_VERSION,
}));
