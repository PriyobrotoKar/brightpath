import type { User } from '@brightpath/db';
import apiClient from '../client';

class AuthController {
  constructor(private base: string) {}

  async sendOtp(email: string): Promise<void> {
    return apiClient.post(`${this.base}/send-otp`, { email });
  }

  async verifyOtp(email: string, otp: string): Promise<User> {
    return apiClient.post(`${this.base}/verify-otp`, { email, otp });
  }
}

const auth = new AuthController('/auth');
export default auth;
