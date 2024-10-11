import { JWTPayload } from '@/user/user.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CourseService {
  constructor() {}

  async createCourse(user: JWTPayload) {}
}
