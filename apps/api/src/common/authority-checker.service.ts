import { PrismaService } from '@/prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class AuthorityCheckerService {
  constructor(private prisma: PrismaService) {}

  async checkAuthorityOverCourse(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        Session: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course:${courseId} not found!`);
    }

    const hasAuthority = course.creatorId === userId;

    if (!hasAuthority) {
      throw new ForbiddenException(
        `User:${userId} does not have the required permission`,
      );
    }

    return course;
  }
}
