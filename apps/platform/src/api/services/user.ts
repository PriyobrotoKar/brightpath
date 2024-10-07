import type { User } from '@brightpath/db';
import apiClient from '../client';

class UserController {
  constructor(private base: string) {}

  async getSelf(): Promise<User> {
    return apiClient.get<User>(this.base);
  }

  async updateSelf(data: Partial<User>): Promise<void> {
    return apiClient.patch(this.base, data);
  }
}

const user = new UserController('/user');
export default user;
