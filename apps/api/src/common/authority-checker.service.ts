import { JWTPayload } from '@/auth/types/jwt-payload';
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

  async checkAuthorityOverCourse(courseSlug: string, user: JWTPayload) {
    const course = await this.prisma.course.findUnique({
      where: {
        slug: courseSlug,
      },
      include: {
        enrollments: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course:${courseSlug} not found!`);
    }

    const hasAuthority =
      user.role === 'CREATOR'
        ? course.creatorId === user.id
        : course.enrollments.length > 0;

    if (!hasAuthority) {
      throw new ForbiddenException(
        `User:${user.id} does not have the required permission`,
      );
    }

    return course;
  }

  async checkAuthorityOverModule(moduleId: string, user: JWTPayload) {
    //check if the module exists
    const module = await this.prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      include: {
        course: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`Module:${moduleId} not found!`);
    }

    //check if the user is the creator of the course of the module
    await this.checkAuthorityOverCourse(module.course.slug, user);

    return module;
  }
}
