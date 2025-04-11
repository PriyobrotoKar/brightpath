import { PrismaService } from '@/prisma/prisma.service';
import { PrismaClient } from '@brightpath/db';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class AuthorityCheckerService {
  private readonly prisma: PrismaClient;
  constructor(private prismaService: PrismaService) {
    this.prisma = this.prismaService.client;
  }

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

  async checkAuthorityOverModule(moduleId: string, userId: string) {
    //check if the module exists
    const module = await this.prisma.module.findUnique({
      where: {
        id: moduleId,
      },
    });

    if (!module) {
      throw new NotFoundException(`Module:${moduleId} not found!`);
    }

    //check if the user is the creator of the course of the module
    await this.checkAuthorityOverCourse(module.courseId, userId);

    return module;
  }
}
